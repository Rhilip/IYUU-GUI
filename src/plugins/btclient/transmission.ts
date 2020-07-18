import {
    TorrentClient,
    TorrentClientConfig,
    TorrentState
} from "@/interfaces/BtClient/AbstractClient";

import axios, {AxiosResponse} from 'axios'
import urljoin from "url-join";
import {
    rawTorrent, TransmissionAddTorrentOptions,
    TransmissionBaseResponse,
    TransmissionRequestMethod,
    TransmissionTorrent, TransmissionTorrentBaseArguments,
    TransmissionTorrentClientConfig, TransmissionTorrentFilterRules,
    TransmissionTorrentGetArguments, TransmissionTorrentGetResponse, TransmissionTorrentRemoveArguments
} from "@/interfaces/BtClient/transmission";


export const defaultTransmissionConfig: TransmissionTorrentClientConfig = {
    type: 'transmission',
    name: 'transmission',
    uuid: '69e8ecd2-9a96-436c-ac6f-c199c1abb846',
    address: 'http://localhost:9091/transmission/rpc',
    username: '',
    password: '',
    timeout: 5 * 60 * 1e3
};

export default class Transmission implements TorrentClient {
    config: TorrentClientConfig;
    authHeader: string;

    sessionId : string = '';

    constructor(options: Partial<TransmissionTorrentClientConfig> = {}) {
        this.config = {...defaultTransmissionConfig, ...options}
        this.authHeader =  'Basic ' + new Buffer(
            this.config.username + (this.config.password ? ':' + this.config.password : '')
        ).toString('base64');  // 直接在constructor的时候生成，防止后续使用时多次生成
    }

    async addTorrent(url: string, options: Partial<TransmissionAddTorrentOptions> = {}): Promise<boolean> {
        if (options.localDownload) {
            const req = await axios.get(url, {
                responseType: 'arraybuffer'
            })
            options.metainfo = Buffer.from(req.data, 'binary').toString('base64')
        } else {
            options.filename = url
        }
        delete options.localDownload

        if (options.savePath) {
            options['download-dir'] = options.savePath
            delete options.savePath
        }

        // Transmission 3.0 以上才支持label
        if (options.label) {
            delete options.label
        }

        options.paused = options.addAtPaused;
        delete options.addAtPaused

        await this.request('torrent-add', options)
        return true;
    }

    async getAllTorrents(): Promise<TransmissionTorrent[]> {
        return await this.getTorrentsBy({})
    }

    async getTorrent(id: number): Promise<TransmissionTorrent> {
        const torrents = await this.getTorrentsBy({
            ids: [id]
        })
        return torrents[0]
    }

    async getTorrentsBy(filter: TransmissionTorrentFilterRules): Promise<TransmissionTorrent[]> {
        let args: TransmissionTorrentGetArguments = {
            fields: [
                'addedDate',
                'id',
                'hashString',
                'isFinished',
                'name',
                'percentDone',
                'uploadRatio',
                'downloadDir',
                'status',
                'totalSize',
                'leftUntilDone',
                'labels'
            ],
        }

        if (filter.ids) {
            args.ids = filter.ids
        }

        const resp = await this.request('torrent-get', args)
        const data:TransmissionTorrentGetResponse = resp.data
        let returnTorrents = data.arguments.torrents.map(s => this._normalizeTorrent(s))

        if (filter.complete) {
            returnTorrents = returnTorrents.filter(s => s.isCompleted)
        }

        return returnTorrents
    }

    async pauseTorrent(id: any): Promise<any> {
        const args: TransmissionTorrentBaseArguments = {
            ids: id
        }
        await this.request('torrent-stop', args)
        return true
    }

    async ping(): Promise<boolean> {
        try {
            const resp = await this.request('session-get')
            const data: TransmissionBaseResponse = resp.data
            return data.result === 'success';
        } catch (e) {
            return false
        }
    }

    async removeTorrent(id: number, removeData: boolean | undefined): Promise<boolean> {
        const args:TransmissionTorrentRemoveArguments = {
            ids: id,
            'delete-local-data': removeData
        }
        await this.request('torrent-remove', args)
        return true
    }

    async resumeTorrent(id: any): Promise<boolean> {
        const args: TransmissionTorrentBaseArguments = {
            ids: id
        }
        await this.request('torrent-start', args)
        return true
    }

    async request(method:TransmissionRequestMethod, args: any = {}): Promise<AxiosResponse> {
        // 修正服务器地址
        let address = this.config.address;
        if (address.indexOf('rpc') === -1) {
            address = urljoin(address, '/transmission/rpc')
        }

        try {
            return await axios.post(address, {
                method: method,
                arguments: args,
            }, {
                headers: {
                    Authorization: this.authHeader,
                    'X-Transmission-Session-Id': this.sessionId
                },
                timeout: this.config.timeout
            })
        } catch (error) {
            if (error.response && error.response.status === 409) {
                this.sessionId = error.response.headers['x-transmission-session-id']  // lower cased header in axios
                return await this.request(method, args)
            } else {
                throw error
            }
        }
    }

    _normalizeTorrent(torrent: rawTorrent): TransmissionTorrent {
        const dateAdded = new Date(torrent.addedDate * 1000).toISOString();

        let state = TorrentState.unknown;
        if (torrent.status === 6) {
            state = TorrentState.seeding;
        } else if (torrent.status === 4) {
            state = TorrentState.downloading;
        } else if (torrent.status === 0) {
            state = TorrentState.paused;
        } else if (torrent.status === 2) {
            state = TorrentState.checking;
        } else if (torrent.status === 3 || torrent.status === 5) {
            state = TorrentState.queued;
        }

        return {
            id: torrent.id,
            infoHash: torrent.hashString,
            name: torrent.name,
            progress: torrent.percentDone,
            isCompleted: torrent.leftUntilDone < 1,
            ratio: torrent.uploadRatio,
            dateAdded: dateAdded,
            savePath: torrent.downloadDir,
            label: torrent.labels && torrent.labels.length ? torrent.labels[0] : undefined,
            state: state,
            totalSize: torrent.totalSize
        };
    }
}