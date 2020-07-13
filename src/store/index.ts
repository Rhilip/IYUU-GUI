import Vue from 'vue'
import Vuex from 'vuex'

// @ts-ignore
import { createPersistedState } from 'vuex-electron'

import IYUU from "@/store/IYUU";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    IYUU
  },
  plugins: [
    createPersistedState()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
