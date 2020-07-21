// TODO 工厂函数

import {EnableSite} from "@/interfaces/IYUU/Site";
import defaultSiteDownload from '@/plugins/sites/default'
import HdChinaDownload from '@/plugins/sites/hdchina'
import HDCityDownload from '@/plugins/sites/hdcity'
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

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