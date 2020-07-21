import {
    AddTorrentOptions,
    Torrent,
    TorrentClient,
    TorrentClientConfig,
    TorrentState
} from "@/interfaces/BtClient/AbstractClient";
import {
    DelugeBooleanStatus, DelugeDefaultResponse,
    DelugeMethod, DelugeRawTorrent,
    DelugeTorrentField, DelugeTorrentFilterRules
} from "@/interfaces/BtClient/deluge";
import urljoin from "url-join";
import axios, {AxiosResponse} from "axios";


// @ts-ignore
export const defaultDelugeConfig: TorrentClientConfig = {
    type: 'deluge',
    name: 'deluge',
    uuid: '8951af53-c6de-49a2-b2c4-3fb63809f453',
    address: 'http://localhost:8112/',
    password: '',
    timeout: 60 * 1e3
};

export default class Deluge implements TorrentClient {
    readonly config: TorrentClientConfig;
    private readonly address: string;

    private _msgId: number;
    private isLogin: boolean = false

    private torrentRequestField: DelugeTorrentField[]= [
        'hash',
        'name',
        'progress',
        'ratio',
        'time_added',
        'save_path',
        'label',
        'state',
        'total_size'
    ]

    constructor(options: Partial<TorrentClientConfig>) {
        this.config = {...defaultDelugeConfig, ...options}
        this._msgId = 0

        // 修正服务器地址
        let address = this.config.address;
        if (address.indexOf('json') === -1) {
            address = urljoin(address, '/json')
        }
        this.address = address
    }

    async ping(): Promise<boolean> {
        return await this.login();
    }

    async addTorrent(url: string, options: Partial<AddTorrentOptions> = {}): Promise<boolean> {
        let delugeOptions = {
            add_paused: false
        }

        if (options.addAtPaused) {
            delugeOptions.add_paused = options.addAtPaused
        }
        if (options.savePath) {
            // @ts-ignore
            delugeOptions.download_location = options.savePath
        }

        // 由于Deluge添加链接和种子的方法名不一样，分开处理
        let method: 'core.add_torrent_file' | 'core.add_torrent_url';
        let params: any;
        if (options.localDownload) {          // 文件 add_torrent_file
            method = 'core.add_torrent_file'
            const req = await axios.get(url, {
                responseType: 'arraybuffer'
            })
            let metainfo = Buffer.from(req.data, 'binary').toString('base64')
            params = ['', metainfo, delugeOptions]
        } else {          // 连接 add_torrent_url
            method = 'core.add_torrent_url'
            params = [url, delugeOptions]
        }

        try {
            const res = await this.request(method,params)
            const data: DelugeDefaultResponse = res.data
            return data.result !== null
        } catch (e) {
            return false
        }
    }

    async getAllTorrents(): Promise<Torrent[]> {
        return await this.getTorrentsBy({})
    }

    async getTorrent(id: string): Promise<Torrent> {
        // @ts-ignore
        return await this.getTorrentsBy({ids: id})
    }

    async getTorrentsBy(filter: DelugeTorrentFilterRules): Promise<Torrent[]> {
        if (filter.ids) {
            filter.hash = filter.ids
            delete filter.hash
        }

        if (filter.complete) {
            filter.state = 'Seeding'
            delete filter.complete
        }

        const req = await this.request('core.get_torrents_status', [
            filter,
            this.torrentRequestField,
        ]);

        const data: DelugeDefaultResponse = req.data

        // @ts-ignore
        return Object.values(data.result).map(t => Deluge._normalizeTorrent(t));
    }

    async pauseTorrent(id: any): Promise<boolean> {
        try {
            const req = await this.request('core.pause_torrent', [id]);
            const data: DelugeBooleanStatus = req.data
            return data.result
        } catch (e) {
            return false
        }
    }

    async removeTorrent(id: string, removeData: boolean = false): Promise<boolean> {
        try {
            const req = await this.request('core.remove_torrent', [id, removeData]);
            const data: DelugeBooleanStatus = req.data
            return data.result
        } catch (e) {
            return false
        }
    }

    async resumeTorrent(id: any): Promise<boolean> {
        try {
            const req = await this.request('core.resume_torrent', [id]);
            const data: DelugeBooleanStatus = req.data
            return data.result
        } catch (e) {
            return false
        }
    }

    private async login(): Promise<boolean> {
        try {
            const res = await this.request('auth.login', [this.config.password])
            const data: DelugeBooleanStatus = res.data
            this.isLogin = data.result
            return data.result
        } catch (e) {
            return false
        }
    }

    private async request(method: DelugeMethod, params: any[]): Promise<AxiosResponse> {
        if (!this.isLogin && method !=='auth.login') {
            await this.login()
        }

        return await axios.post(this.address, {
            id: this._msgId++,
            method: method,
            params: params
        }, {
            headers: {
                'content-type': 'application/json'
            }
        })
    }

    private static _normalizeTorrent(torrent: DelugeRawTorrent): Torrent {
        const dateAdded = new Date(torrent.time_added * 1000).toISOString();
        // normalize state to enum
        let state = TorrentState.unknown;
        if (Object.keys(TorrentState).includes(torrent.state.toLowerCase())) {
            state = TorrentState[torrent.state.toLowerCase() as keyof typeof TorrentState];
        }

        return {
            dateAdded: dateAdded,
            id: torrent.hash,
            infoHash: torrent.hash,
            isCompleted: torrent.progress >= 100,
            name: torrent.name,
            progress: torrent.progress,
            ratio: torrent.ratio,
            savePath: torrent.save_path,
            state: state,
            totalSize: torrent.total_size
        }
    }
}