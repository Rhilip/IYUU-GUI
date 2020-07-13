// @ts-ignore
import _ from 'lodash'
import { Notification } from 'element-ui'
import {Module, VuexModule, Mutation, Action, MutationAction} from 'vuex-module-decorators'

import {Site} from "@/interfaces/IYUU/Site";
import {EnableSite} from "@/interfaces/IYUU/EnableSite";

@Module({namespaced: true, name: 'IYUU'})
export default class IYUU extends VuexModule {
    // 相当于原来的state
    public token: string = ''  // 用户Token
    public self_download_sites: string[] = ['hdchina', 'hdcity']  // 特殊站点，需要自建下载逻辑
    public sites: Site[] = [] // 此处缓存可以使用sites列表（来自服务器）
    public enable_sites: EnableSite[] = [] // 此处缓存用户已经添加了的站点信息
    public enable_clients = [] // 此处缓存用户已经添加了的客户端信息

    get signedSites() {
        return this.enable_sites
    }

    get unsignedSites() {  // 获取用户未添加站点列表
        return _.filter(this.sites, (site: Site) => {
            return _.findIndex(this.enable_sites, {site: site.site}) === -1
        })
    }

    get siteInfo() { // 通过站点名获取来自服务器的站点信息
        return (siteName: string) => {
            return this.sites.find((s: Site) => s.site === siteName)
        }
    }

    get enableSiteInfo() {  // 通过站点名来获取用户添加的站点信息
        return (siteName: string) => {
            return this.enable_sites.find((s: EnableSite) => s.site === siteName)
        }
    }

    get siteDownloadLinkTpl() {
        return (siteName: string) => {
            const siteInfo = this.siteInfo(siteName) as Site

            let linkTpl = ''
            if (siteInfo) {
                linkTpl += siteInfo.is_https === 1 ? 'https://' : 'http://'
                linkTpl += siteInfo.base_url + '/'
                linkTpl += siteInfo.download_page
            }

            // FIXME 采用IYUU老版站点链接生成方式
            switch (siteInfo.site) {
                case 'ttg':
                    linkTpl += '/{passkey}'
                    break
                case 'm-team':
                case 'moecat':
                case 'hdbd':
                    linkTpl += '&passkey={passkey}&https=1'
                    break
                case 'ptpbd':
                    linkTpl += ''
                    break
                default:
                    linkTpl += '&passkey={passkey}'
                    break
            }

            return linkTpl
        }
    }

    @MutationAction({ mutate: ['token']})
    async setToken(token: string) {
        return {token: token}
    }

    @MutationAction({mutate: ['token', 'sites', 'enable_sites', 'enable_clients']})
    async cleanToken() {
        return {
            token: '',
            sites: [],
            enable_sites: [], // TODO 单独提出来，不在退出时清空
            enable_clients: []
        }
    }

    @MutationAction({ mutate: ['sites']})
    async updateSites(sites: Site[]) {
        return {sites: sites}
    }

    @Mutation
    addEnableSite(site: EnableSite) {
        this.enable_sites.push(site)
    }

    @Mutation
    editEnableSite(site: EnableSite) {
        const siteIndex = this.enable_sites.findIndex((s: { site: string }) => s.site === site.site)
        this.enable_sites[siteIndex] = site
        Notification.success(`更新站点 ${site.site} 信息成功`)
    }

    @Mutation
    removeEnableSite(siteId: number) {
        this.enable_sites.splice(siteId, 1)
    }
}