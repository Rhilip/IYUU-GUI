// hdsky站点下载链接构造方法

import axios from 'axios'
import urljoin from "url-join";

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

import Cookies from "@/plugins/cookies";
import iyuuEndpoint from '@/plugins/iyuu'
import {CookiesExpiredError, TorrentNotExistError} from "@/plugins/sites/default";

export default async function (reseedInfo: TorrentInfo, site: EnableSite) {
    // 设置站点Cookies
    await Cookies.setCookiesBySite(site)
    const baseUrl = (site.is_https > 0 ? 'https://' : 'http://') + site.base_url

    // 构造对应种子详情页链接
    const detailsUrl = urljoin(baseUrl, `/details.php?id=${reseedInfo.torrent_id}`)
    const detailsPageRep = await axios.get(detailsUrl)
    const detailsPage = detailsPageRep.data
    if (detailsPage.search('该页面必须在登录后才能访问') > -1) {
        throw new CookiesExpiredError('站点 Cookies 已过期，请更新后重新辅种！')
    }
    if (detailsPage.search('没有该ID的种子') > -1) {
        await iyuuEndpoint.apiNotify({
            site: site.site,
            sid: site.id,
            torrent_id: reseedInfo.sid,
            error: '404'
        })
        throw new TorrentNotExistError(`没有该ID的种子 (站点 ${site.site} ID ${reseedInfo.sid})`)
    }


}