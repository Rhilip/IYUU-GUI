// 种子下载链接构造 工厂函数

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

import defaultSiteDownload from '@/plugins/sites/default'
import HdChinaDownload from '@/plugins/sites/hdchina'
import HDCityDownload from '@/plugins/sites/hdcity'
import HDSkyDownload from '@/plugins/sites/hdsky'

// 合作站点
export const coSite = [
    'ourbits', 'hddolby', 'hdhome', 'pthome', 'chdbits', 'hdai'
]

export const forceDownloadSite = [
    'hdchina', 'hdcity', 'hdsky',
    // 使用 '&uid={uid}&hash={hash}' 的站点
    'pthome', 'hdhome', 'hddolby', 'hdai'
]

export function isForceDownloadSite(name: string) {
    return forceDownloadSite.includes(name)
}

export function defaultSiteRateLimit(name: string) {
    switch (name) {
        case 'ourbits':
        case 'moecat':
        case 'ssd':
            return {maxRequests: 20, requestsDelay: 15}
        case 'hddolby':
        case 'hdhome':
        case 'pthome':
            return {maxRequests: 20, requestsDelay: 5}
        case 'hdsky':
            return {maxRequests: 20, requestsDelay: 20}
        case 'hdchina':
            return {maxRequests: 10, requestsDelay: 5}
        case 'pt':
            return {maxRequests: 20, requestsDelay: 20}
        default:
            return {maxRequests: 0, requestsDelay: 0}
    }
}

export default async function (reseedInfo: TorrentInfo, site: EnableSite) {
    switch (site.site) {
        case 'hdchina':
            return await HdChinaDownload(reseedInfo, site)
        case 'hdcity':
            return await HDCityDownload(reseedInfo, site)
        case 'hdsky':
            return await HDSkyDownload(reseedInfo, site)
        default:
            /**
             * 由于我暂时无精力实现以下站点的传入uid和hash功能，
             * 且这些站点在有cookies的情况下，不需要 '&uid={uid}&hash={hash}' 字符串
             * 所以将这些站点移入 forceDownloadSite 且在传入链接中删去以上字段，
             * 强行使用 /download.php?id={} + Cookies 的形式下载种子
             */
            site.download_page = site.download_page.replace('&uid={uid}&hash={hash}', '')
            return await defaultSiteDownload(reseedInfo, site)
    }
}
