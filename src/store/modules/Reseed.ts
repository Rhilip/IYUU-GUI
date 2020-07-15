import {Module, Mutation, MutationAction, VuexModule} from "vuex-module-decorators";

export interface LogInfo {
    timestamp: number,
    message: string
}

@Module({namespaced: true, name: 'Reseed'})
export default class Reseed extends VuexModule {
    logs: { [logId: string]: LogInfo[] } = {}
    reseeded: { [clientId: string]: string[] } = {}

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
    appendLog(logInfo: {
        logId: string,
        logMessage: string
    }) {
        if (!(logInfo.logId in this.logs)) {
            this.logs[logInfo.logId] = []
        }

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