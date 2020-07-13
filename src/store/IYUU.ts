// @ts-ignore
import _ from 'lodash'
import {Site} from "@/interfaces/IYUU/Site";
import {EnableSite} from "@/interfaces/IYUU/EnableSite";

export default {
    namespaced: true as true,
    state: {
        token: '' as string, // 用户Token
        self_download_sites: ['hdchina', 'hdcity'] as string[], // 特殊站点，需要自建下载逻辑

        sites: [] as Site[], // 此处缓存可以使用sites列表（来自服务器）
        enable_sites: [] as EnableSite[], // 此处缓存用户已经添加了的站点信息
        enable_clients: [] // 此处缓存用户已经添加了的客户端信息
    },

    getters: {
        siteInfo: (state: any) => (siteName: string) => {
            return state.sites.find((s: { site: string }) => s.site === siteName)
        },

        enableSiteInfo: (state: any) => (siteName: string) => {
            return state.enable_sites.find((s: { site: string }) => s.site === siteName)
        },

        signedSites: (state: any) => state.enable_sites,

        unsignedSites: (state: any) => {
            return _.filter(state.sites, (site: { site: any }) => {
                return _.findIndex(state.enable_sites, { site: site.site }) === -1
            })
        },

        siteDownloadLinkTpl: (state: any, getters: { siteInfo: (arg0: string) => Site }) => (site: string) => {
            const siteInfo = getters.siteInfo(site)

            let linkTpl = ''
            if (siteInfo) {
                linkTpl += siteInfo.is_https === 1 ? 'https://' : 'http://'
                linkTpl += siteInfo.base_url + '/'
                linkTpl += siteInfo.download_page
            }

            switch (site) {
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
    },

    mutations: {
        setToken (state: { token: any }, token: any) {
            state.token = token
        },

        // 退出登录（清空Token）时，应该清空所有自定义信息
        clearToken (state: { token: string; enable_sites: never[]; enable_clients: never[] }) {
            state.token = ''
            state.enable_sites = []
            state.enable_clients = []
        },

        updateSites (state: { sites: any }, data: any) {
            state.sites = data
        },

        addEnableSite (state: { enable_sites: any[] }, data: any) {
            state.enable_sites.push(data)
        },

        editEnableSite (state: { enable_sites: any[] }, data: { site: string }) {
            const siteIndex = state.enable_sites.findIndex((s: { site: string}) => s.site === data.site)
            state.enable_sites[siteIndex] = data
        },

        removeEnableSite (state: { enable_sites: any[] }, siteId: number) {
            state.enable_sites.splice(siteId, 1)
        }
    },
    actions: {
        setToken ({ state, commit }: any, token: any) {
            return new Promise((resolve) => {
                commit('setToken', token)
                resolve()
            })
        },

        clearToken ({ commit }: any) {
            return new Promise((resolve) => {
                commit('clearToken')
                resolve()
            })
        },

        updateSites ({ commit }: any, data: any) {
            return new Promise(resolve => {
                commit('updateSites', data)
                resolve()
            })
        },

        addEnableSite ({ commit }: any, data: any) {
            return new Promise(resolve => {
                commit('addEnableSite', data)
                resolve()
            })
        },

        editEnableSite ({ commit }: any, data: any) {
            return new Promise(resolve => {
                commit('editEnableSite', data)
                resolve()
            })
        },

        removeEnableSite ({ commit }: any, data: any) {
            return new Promise(resolve => {
                commit('removeEnableSite', data)
                resolve()
            })
        }
    }
}
