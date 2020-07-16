// @ts-ignore
import _ from 'lodash'
import {Notification} from 'element-ui'
import {Module, VuexModule, Mutation, Action, MutationAction} from 'vuex-module-decorators'

import {Site, EnableSite} from "@/interfaces/IYUU/Site";
import {defaultQbittorrentConfig} from "@/plugins/btclient/qbittorrent";
import {TorrentClientConfig} from "@/interfaces/BtClient/AbstractClient";

import {MissionStore} from '@/store/store-accessor' // circular import; OK though

@Module({namespaced: true, name: 'IYUU'})
export default class IYUU extends VuexModule {
    // 相当于原来的state
    token: string | null = null  // 用户Token
    sites: Site[] = [] // 此处缓存可以使用sites列表（来自服务器）
    enable_sites: EnableSite[] = [] // 此处缓存用户已经添加了的站点信息
    enable_clients: TorrentClientConfig[] = [] // 此处缓存用户已经添加了的客户端信息

    // 这个方法不用state，因为state会被持久化，而这个后续可能会增加站点
    get coSites() {
        return [
            'ourbits', 'hddolby', 'hdhome', 'pthome', 'moecat'
        ]
    }

    // FIXME
    get forceDownloadSite() {
        return [
            'hdchina', 'hdcity'
        ]
    }

    // 理由同上
    get supportClientType() {
        return {
            'qbittorrent': defaultQbittorrentConfig
        }
    }

    get isForceDownloadSite(): (siteName: string) => boolean {
        return (siteName: string) => {
            return this.forceDownloadSite.includes(siteName)
        }
    }

    get signedSites() {
        return this.enable_sites
    }

    get signedBtClient() {
        return this.enable_clients
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
                linkTpl += siteInfo.is_https > 0 ? 'https://' : 'http://'
                linkTpl += siteInfo.base_url + '/'
                linkTpl += siteInfo.download_page
            }

            return linkTpl
        }
    }

    @MutationAction({mutate: ['token']})
    async setToken(token: string) {
        return {token: token}
    }

    @MutationAction({mutate: ['token', 'enable_sites', 'enable_clients']})
    async cleanToken() {
        return {
            token: '',
            enable_sites: [],
            enable_clients: []
        }
    }

    @MutationAction({mutate: ['sites']})
    async updateSites(sites: Site[]) {
        return {sites: sites}
    }

    @MutationAction({mutate: ['sites']})
    async cleanSites() {
        return {sites: []}
    }

    @Mutation
    addEnableSite(site: EnableSite) {
        this.enable_sites.push(site)
        Notification.success(`新增站点 ${site.site} 信息成功`)
    }

    @Mutation
    editEnableSite(site: EnableSite) {
        const siteIndex = this.enable_sites.findIndex((s: { site: string }) => s.site === site.site)
        this.enable_sites[siteIndex] = site
        Notification.success(`更新站点 ${site.site} 信息成功`)
    }

    @Mutation
    removeEnableSite(siteId: number) {
        const siteInfo: EnableSite = this.enable_sites[siteId]
        this.enable_sites.splice(siteId, 1)
        Notification.success('成功删除站点 ' + siteInfo.site)
    }

    @MutationAction({mutate: ['enable_sites']})
    async cleanEnableSites() {
        return {enable_sites: []}
    }

    @Mutation
    addEnableClient(client: TorrentClientConfig) {
        this.enable_clients.push(client)
        Notification.success(`新增下载服务器 ${client.name}(${client.type}) 信息成功`)
    }

    @Mutation
    editEnableClient(client: TorrentClientConfig) {
        const clientIndex = this.enable_clients.findIndex((c) => c.uuid === client.uuid)
        this.enable_clients[clientIndex] = client
        Notification.success(`更新下载服务器 ${client.name}(${client.type}) 信息成功`)
    }

    @Mutation
    removeEnableClient(clientId: number) {
        const clientInfo: TorrentClientConfig = this.enable_clients[clientId]
        this.enable_clients.splice(clientId, 1)
        MissionStore.cleanReseededByClientId(clientInfo.uuid)
        Notification.success(`成功删除下载服务器 ${clientInfo.name}(${clientInfo.type})`)
    }

    @MutationAction({mutate: ['enable_clients']})
    async cleanEnableClients() {
        for (let i = 0; i < this.enable_clients.length; i++) {
            const clientInfo = this.enable_clients[i]
            MissionStore.cleanReseededByClientId(clientInfo.uuid)
        }

        return {enable_clients: []}
    }
}