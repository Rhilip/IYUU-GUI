import _ from 'lodash'

export default {
  namespaced: true,
  state: {
    token: '', // 用户Token
    self_download_sites: ['hdchina', 'hdcity'], // 特殊站点，需要自建下载逻辑

    sites: [], // 此处缓存可以使用sites列表（来自服务器）
    enable_sites: [], // 此处缓存用户已经添加了的站点信息
    enable_clients: [] // 此处缓存用户已经添加了的客户端信息
  },

  getters: {
    siteInfo: state => siteName => {
      return state.sites.find((s) => s.site === siteName)
    },

    enableSiteInfo: state => siteName => {
      return state.enable_sites.find((s) => s.site === siteName)
    },

    signedSites: state => state.enable_sites,

    unsignedSites: state => {
      return _.filter(state.sites, site => {
        return _.findIndex(state.enable_sites, {'site': site.site}) === -1
      })
    },

    siteDownloadLinkTpl: (state, getters) => site => {
      const siteInfo = getters.siteInfo(site)

      let linkTpl = ''
      if (siteInfo) {
        linkTpl += siteInfo['is_https'] === 1 ? 'https://' : 'http://'
        linkTpl += siteInfo['base_url'] + '/'
        linkTpl += siteInfo['download_page']
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
    setToken (state, token) {
      state.token = token
    },

    // 退出登录（清空Token）时，应该清空所有自定义信息
    clearToken (state) {
      state.token = ''
      state.enable_sites = []
      state.enable_clients = []
    },

    updateSites (state, data) {
      state.sites = data
    },

    addEnableSite (state, data) {
      state.enable_sites.push(data)
    },

    editEnableSite (state, data) {
      const siteIndex = state.enable_sites.findIndex((s) => s.site === data.site)
      state.enable_sites[siteIndex] = data
    },

    removeEnableSite (state, siteId) {
      state.enable_sites.splice(siteId, 1)
    }
  },
  actions: {
    setToken ({state, commit}, token) {
      return new Promise((resolve) => {
        commit('setToken', token)
        resolve()
      })
    },

    clearToken ({commit}) {
      return new Promise((resolve) => {
        commit('clearToken')
        resolve()
      })
    },

    updateSites ({commit}, data) {
      return new Promise(resolve => {
        commit('updateSites', data)
        resolve()
      })
    },

    addEnableSite ({commit}, data) {
      return new Promise(resolve => {
        commit('addEnableSite', data)
        resolve()
      })
    },

    editEnableSite ({commit}, data) {
      return new Promise(resolve => {
        commit('editEnableSite', data)
        resolve()
      })
    },

    removeEnableSite ({commit}, data) {
      return new Promise(resolve => {
        commit('removeEnableSite', data)
        resolve()
      })
    }
  }
}
