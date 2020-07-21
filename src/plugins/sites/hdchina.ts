// TODO hdchina站点下载链接构造逻辑

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";
import Cookies from "@/plugins/cookies";
import iyuuEndpoint from '@/plugins/iyuu'
import axios from 'axios'
import {CookiesExpiredError, TorrentNotExistError} from "@/plugins/sites/default";
import urljoin from "url-join";

export default async function (reseedInfo: TorrentInfo, site: EnableSite) {
    // 设置站点Cookies
    await Cookies.setCookiesBySite(site)
    const baseUrl = (site.is_https > 0 ? 'https://' : 'http://') + site.base_url

    // 构造对应种子详情页链接
    const detailsUrl = urljoin(baseUrl, `/details.php?id=${reseedInfo.torrent_id}`)
    console.log(detailsUrl)
    const detailsPageRep = await axios.get(detailsUrl)
    const detailsPage = detailsPageRep.data
    if (detailsPage === '') {
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

    // 直接使用正则提取
    let path = (detailsPage.match(/href="(download\.php\?hash=[^"]+?)">/) || ['', ''])[1]
    if (path) {
        return urljoin(baseUrl, path)
    }

    throw new Error(`未提取到该ID的种子链接 (站点 ${site.site} ID ${reseedInfo.sid})`)
}