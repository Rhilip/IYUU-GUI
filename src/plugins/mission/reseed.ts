// 转发使用的核心方法
import UUID from 'uuid'

import {EnableSite} from "@/interfaces/IYUU/Site";
import {AddTorrentOptions, TorrentClientConfig} from "@/interfaces/BtClient/AbstractClient";
import btClientFactory from "@/plugins/btclient/factory";

import iyuuEndpoint from "@/plugins/iyuu";

import {MissionStore, IYUUStore} from '@/store/store-accessor' // circular import; OK though
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

export interface ReseedStartOption {
    label: string
    weChatNotify: {
        summary: boolean,   // 是否推送摘要信息
        fullLog: boolean    // 是否推送详细日志
    },
}

export default class Reseed {
    static async start(sites: EnableSite[], clientsConfig: TorrentClientConfig[], callback: Function, options?: Partial<ReseedStartOption>): Promise<void> {
        const logId = UUID.v4()

        MissionStore.updateCurrentMissionState({
            processing: true,
            logId: logId
        })

        callback(logId)  // 使用callback立即返回

        const logger = (msg: string) => {
            MissionStore.appendLog({logId: logId, logMessage: msg})
        }

        logger(`开始辅种任务，任务Id： ${logId}。启用下载服务器数 ${clientsConfig.length}， 启用站点数 ${sites.length}。`)

        // 筛选出启用站点id
        const siteIds = sites.map(s => s.id)

        // 开始遍历下载器
        for (let i = 0; i < clientsConfig.length; i++) {
            const client = btClientFactory(clientsConfig[i])

            logger(`正在检查下载服务器 ${client.config.name}(${client.config.type}) 的连接性。`)
            const connect = await client.ping()
            if (connect) {
                logger(`已成功连接到下载服务器 ${client.config.name}(${client.config.type})，开始请求已完成种子清单。`)

                // 获得已下载完成的种子
                const torrents = await client.getTorrentsBy({
                    complete: true
                })

                // 从缓存中获取该下载器已经转发过的infoHash
                const reseedTorrentInfoHashs = MissionStore.reseededByClientId(client.config.uuid)

                // 筛选出未被转发过的种子infohash
                const unReseedTorrent = torrents.filter(t => !reseedTorrentInfoHashs.includes(t.infoHash))

                logger(`从下载器 ${client.config.name}(${client.config.type}) 中获取到 ${torrents.length} 个已完成种子，其中 未被转发过的有 ${unReseedTorrent.length} 个。`)
                logger(`当前下载器总共缓存了 ${reseedTorrentInfoHashs.length} 个种子 infoHash 历史。`)

                // 请求IYUU服务器
                const resp = await iyuuEndpoint.apiHash(unReseedTorrent.map(t => t.infoHash))
                for (let j = 0; j < resp.data.length; j++) {
                    const reseedTorrentsDataFromIYUU = resp.data[j]
                    const reseedTorrentDataFromClient = torrents.find(t=> t.infoHash === reseedTorrentsDataFromIYUU.hash)

                    // 筛选需要转发的种子
                    const canReseedTorrents = reseedTorrentsDataFromIYUU.torrent.filter(t => {
                        return siteIds.includes(t.sid) // 对应种子在转发站点中
                            && !reseedTorrentInfoHashs.includes(t.info_hash); // 这个种子未命中该下载器的转发缓存
                    })

                    logger(`种子 ${reseedTorrentsDataFromIYUU.hash}： IYUU 返回 ${reseedTorrentsDataFromIYUU.torrent.length} 个待选种子，其中可添加 ${canReseedTorrents.length} 个`)

                    for (let k = 0; k < canReseedTorrents.length; k++) {
                        const reseedTorrent: TorrentInfo = canReseedTorrents[k]

                        const siteInfoForThisTorrent = sites.find(s => s.id === reseedTorrent.sid)
                        if (siteInfoForThisTorrent && reseedTorrentDataFromClient) {  // 因为ts限制，这里要加一层判断（但实际并没有必要）
                            // TODO 检查是否触及到站点流控规则

                            // 将种子连接模板中剩下的{} 替换成 IYUU给出的种子id
                            let torrentLink = siteInfoForThisTorrent.link.replace(/{}/ig, String(reseedTorrent.torrent_id))

                            // TODO 如果是特殊站点，则弃用模板生成的下载链接，改成使用自建逻辑进行操作
                            if (IYUUStore.isForceDownloadSite(siteInfoForThisTorrent.site)) {
                                torrentLink = ''
                            }

                            let downloadOptionsForThisTorrent: AddTorrentOptions = {
                                savePath: reseedTorrentDataFromClient.savePath,
                                addAtPaused: true,   // 置于暂停状态
                                localDownload: siteInfoForThisTorrent.download_torrent
                            }

                            if (options && options.label) {
                                downloadOptionsForThisTorrent.label = options.label
                            }

                            // 推送种子链接（由本地btclient代码根据传入参数决定推送的是链接还是文件）
                            const addTorrentStatue = await client.addTorrent(torrentLink, downloadOptionsForThisTorrent)
                            if (addTorrentStatue) {
                                logger(`添加种子 ${reseedTorrent.info_hash} 成功，来自站点 ${siteInfoForThisTorrent.site}。`)
                            } else {
                                logger(`添加种子 ${reseedTorrent.info_hash} 失败，站点 ${siteInfoForThisTorrent.site}，请考虑手动下载添加，链接 ${torrentLink} 。`)
                            }
                            MissionStore.appendReseeded({
                                clientId: client.config.uuid, infoHash: reseedTorrent.info_hash
                            })
                        }
                    }
                }

                // TODO
            } else {
                logger(`下载器 ${client.config.name}(${client.config.type}) 连接失败`)
            }
        }

        logger(`辅种任务已完成，任务Id： ${logId}`)
        MissionStore.updateCurrentMissionState({
            processing: false,
            logId: logId
        })
    }
}