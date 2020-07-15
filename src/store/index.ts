import Vue from 'vue'
import Vuex, {Store} from 'vuex'
// Note: you shouldn't need to import store modules here.
import {initializeStores, modules} from '@/store/store-accessor'

// @ts-ignore
import {createPersistedState} from 'vuex-electron'

Vue.use(Vuex)


// Initialize the modules using a Vuex plugin that runs when the root store is
// first initialized. This is vital to using static modules because the
// modules don't know the root store when they are loaded. Initializing them
// when the root store is created allows them to be hooked up properly.
const initializer = (store: Store<any>) => initializeStores(store)

export const plugins = [
    initializer,
    createPersistedState({
        blacklist: ['Reseed/appendLog']
    })
]

export * from '@/store/store-accessor' // re-export the modules

// Export the root store. You can add mutations & actions here as well.
// Note that this is a standard Vuex store, not a vuex-module-decorator one.
// (Perhaps could be, but I put everything in modules)
export default new Store({
    plugins, // important!
    modules, // important!
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
    strict: process.env.NODE_ENV !== 'production'
})