import {Module, Mutation, MutationAction, VuexModule} from "vuex-module-decorators";
import {LogInfo} from "@/interfaces/store";

@Module({namespaced: true, name: 'Mission'})
export default class Mission extends VuexModule {
    logs: { [logId: string]: LogInfo[] } = {}
    reseeded: { [clientId: string]: string[] } = {}

    currentMission = {
        logId: '',
        processing: false
    }

    get logByLogId(): (logId: string) => LogInfo[] {
        return (logId: string) => {
            return logId in this.logs ? this.logs[logId] : []
        }
    }

    get reseededByClientId(): (clientId: string) => string[] {
        return (clientId: string) => {
            return clientId in this.reseeded ? this.reseeded[clientId] : []
        }
    }

    @Mutation
    updateCurrentMissionState(mission: { processing: boolean; logId: string }) {
        this.currentMission = mission
    }

    @Mutation
    appendLog(logInfo: {
        logId: string,
        logMessage: string
    }) {
        if (!(logInfo.logId in this.logs)) {
            this.logs[logInfo.logId] = []
        }

        this.currentMission.logId = logInfo.logId
        this.logs[logInfo.logId].push({
            timestamp: Date.now(),
            message: logInfo.logMessage
        })
    }

    @Mutation
    appendReseeded(hashInfo: {
        clientId: string,
        infoHash: string
    }) {
        if (!(hashInfo.clientId in this.reseeded)) {
            this.reseeded[hashInfo.clientId] = []
        }

        this.reseeded[hashInfo.clientId].push(hashInfo.infoHash)
    }

    @Mutation
    cleanReseededByClientId(clientId: string) {
        if (clientId in this.reseeded) {
            this.reseeded[clientId] = []
        }
    }

    @MutationAction({mutate: ['reseeded']})
    async cleanReseeded() {
        return {reseeded: []}
    }
}