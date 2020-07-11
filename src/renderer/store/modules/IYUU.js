/* eslint-disable */
export default {
  namespaced: true,
  state: {
    token: '',
    sites: []
  },
  mutations: {
    setToken(state, token) {
      state.token = token
    },

    clearToken(state) {
      state.sites = []
      state.token = ''
    },

    updateSites(state, site, data) {
      state.sites[site] = data
    },
  },
  actions: {
    setToken({state, commit}, token) {
      return new Promise(((resolve) => {
        commit('setToken', token)
        resolve()
      }))
    },

    clearToken({commit}) {
      return new Promise(((resolve) => {
        commit('clearToken')
        resolve()
      }))
    },

    updateSites({commit}, site, data) {
      return new Promise((resolve => {
        commit('updateSites', site, data)
        resolve()
      }))
    }
  }
}
