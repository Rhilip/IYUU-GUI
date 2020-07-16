// 转发使用的核心方法
import UUID from 'uuid'
import _ from 'lodash'

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentClientConfig} from "@/interfaces/BtClient/AbstractClient";
import factory from "@/plugins/btclient/factory";

import iyuuEndpoint from "@/plugins/iyuu";

import {MissionStore} from '@/store/store-accessor' // circular import; OK though

export interface ReseedStartOption {
    weChatNotify?: {
        summary: boolean,   // 是否推送摘要信息
        fullLog: boolean    // 是否推送详细日志
    },

}

export default class Reseed {
    static async start(sites: EnableSite[], clientsConfig: TorrentClientConfig[], callback: Function, options?: ReseedStartOption): Promise<void> {
        const logId = UUID.v4()

        MissionStore.updateCurrentMissionState({
            processing: true,
            logId: logId
        })

        callback(logId)  // 使用callback立即返回logId信息，剩下让它慢慢跑

        const logger = (msg: string) => {
            MissionStore.appendLog({logId: logId, logMessage: msg})
        }

        logger(`开始辅种任务，任务Id： ${logId}。启用下载服务器数 ${clientsConfig.length}， 启用站点数 ${sites.length}。`)
        for (let i = 0; i < clientsConfig.length; i++) {
            const client = factory(clientsConfig[i])

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
                /**
                const resp = await iyuuEndpoint.apiHash(unReseedTorrent.map(t => t.infoHash))
                for (let j = 0; j < resp.data.length; j++) {
                    const reseedTorrentsData = resp.data[j]

                    const canReseedTorrents = reseedTorrentsData.torrent.filter(t => {
                        return !reseedTorrentInfoHashs.includes(t.info_hash)  // 这个种子未命中该下载器的转发缓存
                            && true
                    })

                    for (let k = 0; k < reseedTorrentsData.torrent.length; k++) {
                        const reseedTorrent = reseedTorrentsData.torrent[k]
                        break;
                    }
                }
                */

                // TODO
            }
        }

        logger(`辅种任务已完成，任务Id： ${logId}`)
        MissionStore.updateCurrentMissionState({
            processing: false,
            logId: logId
        })
    }
}