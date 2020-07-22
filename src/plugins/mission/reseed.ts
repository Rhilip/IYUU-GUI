// 转发使用的核心方法
import UUID from 'uuid'
import _ from 'lodash'
import {ipcRenderer} from 'electron'

import {EnableSite} from "@/interfaces/IYUU/Site";
import {AddTorrentOptions, TorrentClientConfig} from "@/interfaces/BtClient/AbstractClient";
import btClientFactory from "@/plugins/btclient/factory";
import downloadFactory from '@/plugins/sites/factory';

import iyuuEndpoint from "@/plugins/iyuu";

import {MissionStore, IYUUStore, StatusStore} from '@/store/store-accessor' // circular import; OK though
import {TorrentInfo} from "@/interfaces/IYUU/Forms";
import {sleep} from "@/plugins/common";
import dayjs from "dayjs";
import {CookiesExpiredError, TorrentNotExistError} from "@/plugins/sites/default";

export interface ReseedStartOption {
    dryRun: boolean
    label: string,
    weChatNotify: boolean,  // 是否将信息推送给微信
    closeAppAfterRun: boolean
}

class RateLimitError extends Error {}

export default class Reseed {
    // 传入参数
    private readonly sites: EnableSite[];
    private readonly clients: TorrentClientConfig[];
    private readonly options: Partial<ReseedStartOption>;

    // constructor时生成
    readonly logId: string;

    private siteIds: number[]
    private rateLimitSites: {
        [prop_name: string]: {
            last_hit_timestamp: number,
            total_count: number
        }
    };

    constructor(sites: EnableSite[], clientsConfig: TorrentClientConfig[], options: Partial<ReseedStartOption>) {
        this.sites = sites
        this.clients = clientsConfig
        this.options = options

        this.logId = UUID.v4()

        this.siteIds = sites.map(s => s.id)
        this.rateLimitSites = {}

    }

    private missionStart() {
        StatusStore.missionStart()

        MissionStore.updateCurrentMissionState({
            processing: true,
            logId: this.logId
        })
    }

    private missionEnd() {
        this.logger(`辅种任务已完成，任务Id： ${this.logId}`)
        MissionStore.updateCurrentMissionState({
            processing: false,
            logId: this.logId
        })

        // TODO 发送微信通知

        if (this.options.closeAppAfterRun) {
            ipcRenderer.send('close-me')
        }
    }

    async start(): Promise<void> {
        this.missionStart()

        this.logger(`开始辅种任务，任务Id： ${this.logId}。启用下载服务器数 ${this.clients.length}， 启用站点数 ${this.sites.length}。`)
        if (this.options.dryRun) {
            this.logger(`这是一次空运行，软件不会把种子链接或者种子文件发送给做种服务器，如果该站点属于特殊站点，软件同样不会解析页面来获取下载链接。`)

            const rateLimitSites = this.sites.filter(s => s.rate_limit && (s.rate_limit.maxRequests > 0 || s.rate_limit.requestsDelay > 0))
            if (rateLimitSites.length > 0) {
                this.logger(`这是一次空运行，站点 ${rateLimitSites.map(s => s.site).join(',')} 的下载频率限制同样不会生效。`)
            }
        }

        // 开始遍历下载器
        for (let i = 0; i < this.clients.length; i++) {
            try {
                await this.loopClient(this.clients[i])
            } catch (e) {
                this.logger(`下载器 ${this.clients[i].name}(${this.clients[i].type}) 处理错误： ${e}`)
            }

        }

        this.missionEnd()
    }

    private logger(msg: string) {
        MissionStore.appendLog({logId: this.logId, logMessage: msg})
    }

    private async loopClient(config: TorrentClientConfig) {
        const client = btClientFactory(config)

        this.logger(`正在检查下载服务器 ${client.config.name}(${client.config.type}) 的连接性。`)
        const connect = await client.ping()
        if (connect) {
            this.logger(`已成功连接到下载服务器 ${client.config.name}(${client.config.type})，开始请求已完成种子清单。`)

            // 获得已下载完成的种子
            const torrents = await client.getTorrentsBy({
                complete: true
            })

            // 从缓存中获取该下载器已经转发过的infoHash
            const reseedTorrentInfoHashs = MissionStore.reseededByClientId(client.config.uuid)

            // 筛选出未被转发过的种子infohash
            const unReseedTorrents = torrents.filter(t => !reseedTorrentInfoHashs.includes(t.infoHash))

            this.logger(`从下载器 ${client.config.name}(${client.config.type}) 中获取到 ${torrents.length} 个已完成种子，其中 未被转发过的有 ${unReseedTorrents.length} 个。`)
            this.logger(`当前下载器总共缓存了 ${reseedTorrentInfoHashs.length} 个种子 infoHash 历史。`)

            const chunkUnReseedTorrents = _.chunk(unReseedTorrents, IYUUStore.apiPreInfoHash)
            if (chunkUnReseedTorrents.length > 1) {
                this.logger(`由于当前infoHash总数超过最大单次请求限制（设置值 ${IYUUStore.apiPreInfoHash}），程序将分成多次进行请求。`)
            }

            for (let i = 0; i < chunkUnReseedTorrents.length; i++) {
                const chunkUnReseedTorrent = chunkUnReseedTorrents[i]
                // 将分片信息请求IYUU服务器
                const resp = await iyuuEndpoint.apiHash(chunkUnReseedTorrent.map(t => t.infoHash))
                this.logger(`在提交的 ${chunkUnReseedTorrent.length} 个infoHash值里， IYUU服务器共返回 ${resp.data.length || 0} 个可辅种结果。`)
                for (let j = 0; j < resp.data.length; j++) {
                    const reseedTorrentsDataFromIYUU = resp.data[j]
                    const reseedTorrentDataFromClient = torrents.find(t => t.infoHash === reseedTorrentsDataFromIYUU.hash)

                    // 筛选需要转发的种子
                    const canReseedTorrents = reseedTorrentsDataFromIYUU.torrent.filter(t => {
                        return this.siteIds.includes(t.sid) // 对应种子在转发站点中
                            && !reseedTorrentInfoHashs.includes(t.info_hash); // 这个种子未命中该下载器的转发缓存
                    })

                    this.logger(`种子 ${reseedTorrentsDataFromIYUU.hash}： IYUU 返回 ${reseedTorrentsDataFromIYUU.torrent.length} 个待选种子，其中可添加 ${canReseedTorrents.length} 个`)

                    let partialFail = 0;  // 部分辅种 infohash 出现错误，此时不应添加原种子缓存
                    for (let k = 0; k < canReseedTorrents.length; k++) {
                        const reseedTorrent: TorrentInfo = canReseedTorrents[k]

                        const siteInfoForThisTorrent = this.sites.find(s => s.id === reseedTorrent.sid)
                        if (siteInfoForThisTorrent && reseedTorrentDataFromClient) {  // 因为ts限制，这里要加一层判断（但实际并没有必要）
                            if (this.options.dryRun) {
                                this.logger(`将会推送 站点 ${siteInfoForThisTorrent.site}，id为 ${reseedTorrent.torrent_id} 的 种子链接/种子文件 到下载器 ${client.config.name}(${client.config.type})。`)
                                continue;
                            }

                            // 检查是否触及到站点流控规则
                            try {
                                await this.siteRateLimitCheck(siteInfoForThisTorrent)
                            } catch (e) {
                                continue
                            }

                            let downloadOptionsForThisTorrent: AddTorrentOptions = {
                                savePath: reseedTorrentDataFromClient.savePath,
                                addAtPaused: true,   // 置于暂停状态
                                localDownload: siteInfoForThisTorrent.download_torrent
                            }

                            /* TODO 设置标签
                             * if (this.options.label) {
                             *     downloadOptionsForThisTorrent.label = this.options.label
                             * }
                             */

                            try {
                                // 使用工厂函数方法，构造种子真实下载链接
                                let torrentLink = await downloadFactory(reseedTorrent, siteInfoForThisTorrent)

                                // 加重试版 推送种子链接（由本地btclient代码根据传入参数决定推送的是链接还是文件）
                                let retryCount = 0;
                                while (retryCount++ < IYUUStore.maxRetry) {
                                    const addTorrentStatue = await client.addTorrent(torrentLink, downloadOptionsForThisTorrent)
                                    if (addTorrentStatue) {
                                        this.logger(`添加站点 ${siteInfoForThisTorrent.site} 种子 ${reseedTorrent.info_hash} 成功。`)
                                        StatusStore.torrentReseed()  // 增加辅种成功计数
                                        MissionStore.appendReseeded({  // 将这个infoHash加入缓存中
                                            clientId: client.config.uuid, infoHash: reseedTorrent.info_hash
                                        })
                                        break;  // 退出重试循环
                                    } else {
                                        partialFail++;
                                        this.logger(`添加站点 ${siteInfoForThisTorrent.site} 种子 ${reseedTorrent.info_hash} 失败。`)
                                        if (retryCount === IYUUStore.maxRetry) {
                                            this.logger(`请考虑为下载器 ${client.config.name}(${client.config.type}) 手动下载添加，链接 ${torrentLink} 。`)
                                        } else {
                                            const sleepSecond = Math.min(30, Math.pow(2, retryCount))
                                            this.logger(`等待 ${sleepSecond} 秒进行第 ${retryCount} 次推送重试`)
                                            await sleep(sleepSecond * 1e3)
                                        }
                                    }
                                }
                            } catch (e) {
                                this.logger(`种子下载链接构造失败， 站点 ${siteInfoForThisTorrent.site} 种子id： ${reseedTorrent.sid}。原因： ${e}`)

                                // Cookies过期
                                if (e instanceof CookiesExpiredError) {
                                    this.tempRemoveSite(siteInfoForThisTorrent, `${e}`)
                                }

                                if (!(e instanceof TorrentNotExistError)) {
                                    partialFail++;
                                }
                            }
                        }
                    }

                    if (!this.options.dryRun  // 非空运行
                        && canReseedTorrents.length > 0  // 可用辅种数量大于0
                        && partialFail === 0  // 未出现失败辅种
                    ) {
                        MissionStore.appendReseeded({  // 将原种的infohash加入缓存
                            clientId: client.config.uuid, infoHash: reseedTorrentsDataFromIYUU.hash
                        })
                    }
                }
            }

            // TODO
        } else {
            this.logger(`下载器 ${client.config.name}(${client.config.type}) 连接失败`)
        }
    }

    private tempRemoveSite(site: EnableSite, reason: string = '') {
        this.logger(`本次运行不再推送站点 ${site.site}， 原因 ： "${reason}"。`)
        const siteOrderId = this.siteIds.findIndex(i => i === site.id)
        this.siteIds.splice(siteOrderId, 1)
    }


    private async siteRateLimitCheck(site: EnableSite) {
        const siteRateLimitRule = site.rate_limit
        // 建立字典
        if (!(site.site in this.rateLimitSites)) {
            this.rateLimitSites[site.site] = {
                last_hit_timestamp: 0,
                total_count: 0
            }
        }

        // 检查该站点是否达到最大下载
        if (siteRateLimitRule.maxRequests > 0) {
            if (this.rateLimitSites[site.site].total_count > siteRateLimitRule.maxRequests) {
                this.tempRemoveSite(site, `触及到推送限制规则： 单次运行最多推送 ${siteRateLimitRule.maxRequests} 个种子`)
                throw new RateLimitError(`站点 ${site.site} 触及到推送限制规则`)
            } else {
                this.rateLimitSites[site.site].total_count++
            }
        }

        if (siteRateLimitRule.requestsDelay > 0) {
            const waitTime = siteRateLimitRule.requestsDelay * 1e3
            const dateNow = Date.now()
            // 计算剩余等待时间，并等待
            const elapseTime = dateNow - (waitTime + this.rateLimitSites[site.site].last_hit_timestamp)
            if (elapseTime > 0) {
                this.logger(`站点 ${site.site} 通过推送间隔检查，上次推送时间 ${dayjs(this.rateLimitSites[site.site].last_hit_timestamp).format('YYYY-MM-DD HH:mm:ss')}，间隔 ${elapseTime / 1e3} 秒。`)
            } else {
                this.logger(`站点 ${site.site} 触及到推送限制规则： 连续两次推送间隔 ${siteRateLimitRule.requestsDelay} 秒。等待 ${-elapseTime / 1e3}秒后重试。`)
                await sleep(-elapseTime)
            }

            this.rateLimitSites[site.site].last_hit_timestamp = Date.now()
        }
    }
}