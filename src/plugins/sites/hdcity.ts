// hdcity站点下载链接构造逻辑

import urljoin from "url-join";
import axios from "axios";

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentInfo} from "@/interfaces/IYUU/Forms";

import Cookies from "@/plugins/cookies";
import iyuuEndpoint from "@/plugins/iyuu";
import {CookiesExpiredError, TorrentNotExistError} from "@/plugins/sites/default";

let cuhash: string | null = null;

export default async function (reseedInfo: TorrentInfo, site: EnableSite) {

    const baseUrl = (site.is_https > 0 ? 'https://' : 'http://') + site.base_url
    if (typeof cuhash !== 'string') {
        // 设置站点Cookies
        await Cookies.setCookiesBySite(site)
        const detailsUrl = urljoin(baseUrl, `t-${reseedInfo.torrent_id}`)
        const detailsPageRep = await axios.get(detailsUrl)
        const detailsPage = detailsPageRep.data
        if (detailsPage.search('HDCITY PORTAL') > -1) {
            throw new CookiesExpiredError('站点 Cookies 已过期，请更新后重新辅种！')
        }
        if (detailsPage.search('木有该ID的种子，可能输入错误或已被删除。') > -1) {
            await iyuuEndpoint.apiNotify({
                site: site.site,
                sid: site.id,
                torrent_id: reseedInfo.sid,
                error: '404'
            })
            throw new TorrentNotExistError(`没有该ID的种子 (站点 ${site.site} ID ${reseedInfo.sid})`)
        }

        // 使用正则提取cuhash
        let tmpCuhash = (detailsPage.match('cuhash=([a-z0-9]+)') || ['', ''])[1]
        if (tmpCuhash) {
            cuhash = tmpCuhash
        }
    }

    if (cuhash) {
        return urljoin(baseUrl, `download?id=${reseedInfo.torrent_id}&cuhash=${cuhash}`)
    }

    throw new Error(`未提取到该ID的种子链接 (站点 ${site.site} ID ${reseedInfo.sid})`)
}