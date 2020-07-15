import Vue from 'vue'
import Vuex from 'vuex'

// @ts-ignore
import { createPersistedState } from 'vuex-electron'

import IYUU from "@/store/IYUU";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    startAppCount: 0,
    startMissionCount: 0,
    reseedTorrentCount: 0
  },
  mutations: {
    appStart(state) {
      state.startAppCount++
    },

    cleanAppStart(state) {
      state.startAppCount = 0
    },

    missionStart(state) {
      state.startMissionCount++
    },

    cleanMissionStart(state) {
      state.startMissionCount = 0
    },

    torrentReseed(state) {
      state.reseedTorrentCount++
    },

    cleanTorrentReseed(state) {
      state.reseedTorrentCount = 0
    }
  },
  actions: {
    cleanAppStart(context) {
      context.commit('cleanAppStart')
    },
    cleanMissionStart(context) {
      context.commit('cleanMissionStart')
    },
    cleanTorrentReseed(context) {
      context.commit('cleanTorrentReseed')
    },
  },
  modules: {
    IYUU
  },
  plugins: [
    createPersistedState()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
