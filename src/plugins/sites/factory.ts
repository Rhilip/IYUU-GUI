// 种子下载链接构造 工厂函数

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

import defaultSiteDownload from '@/plugins/sites/default'
import HdChinaDownload from '@/plugins/sites/hdchina'
import HDCityDownload from '@/plugins/sites/hdcity'

export default async function (reseedInfo: TorrentInfo, site: EnableSite) {
    switch (site.site) {
        case 'hdchina':
            return await HdChinaDownload(reseedInfo, site)
        case 'hdcity':
            return await HDCityDownload(reseedInfo, site)
        default:
            return await defaultSiteDownload(reseedInfo, site)
    }
}