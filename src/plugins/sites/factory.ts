// 种子下载链接构造 工厂函数

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

import defaultSiteDownload from '@/plugins/sites/default'
import HdChinaDownload from '@/plugins/sites/hdchina'
import HDCityDownload from '@/plugins/sites/hdcity'
import HDSkyDownload from '@/plugins/sites/hdsky'

// 合作站点
export const coSite = [
    'ourbits', 'hddolby', 'hdhome', 'pthome', 'chdbits'
]

export const forceDownloadSite = [
    'hdchina', 'hdcity', 'hdsky'
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
            return await defaultSiteDownload(reseedInfo, site)
    }
}