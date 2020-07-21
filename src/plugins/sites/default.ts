// 普通站点链接构造逻辑

import {EnableSite} from "@/interfaces/IYUU/Site";
import Cookies from "@/plugins/cookies";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";


export default async function (reseedInfo: TorrentInfo, site: EnableSite) {
    // 将种子连接模板中剩下的{} 替换成 IYUU给出的种子id
    let url = site.link.replace(/{}/ig, String(reseedInfo.torrent_id))

    // 如果站点需要本地下载，则设置Cookies
    if (site.download_torrent) {
        await Cookies.setCookiesBySite(site)
    }

    // 返回原链接
    return url
}