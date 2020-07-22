import {Module, Mutation, MutationAction, VuexModule} from "vuex-module-decorators";

@Module({namespaced: true, name: 'Status'})
export default class Status extends VuexModule {
    startAppCount: number = 0
    startMissionCount: number = 0
    reseedTorrentCount: number = 0

    @Mutation
    appStart() {
        this.startAppCount++
    }

    @MutationAction({mutate:['startAppCount']})
    async cleanAppStart() {
        return {startAppCount: 0}
    }

    @Mutation
    missionStart() {
        this.startMissionCount++
    }

    @MutationAction({mutate:['startMissionCount']})
    async cleanMissionStart() {
        return {startMissionCount: 0}
    }

    @Mutation
    torrentReseed() {
        this.reseedTorrentCount++
    }

    @MutationAction({mutate:['reseedTorrentCount']})
    async cleanTorrentReseed() {
        return {reseedTorrentCount: 0}
    }

    @Mutation
    restoreFromConfig(config: {
        startAppCount: number
        startMissionCount: number
        reseedTorrentCount: number
    }) {
        this.startAppCount = config.startAppCount
        this.startMissionCount = config.startMissionCount
        this.reseedTorrentCount = config.reseedTorrentCount
    }
}