import {TorrentClient, TorrentState} from "@/interfaces/BtClient/AbstractClient";
import {
    QbittorrentAddTorrentOptions,
    QbittorrentTorrent,
    QbittorrentTorrentClientConfig,
    QbittorrentTorrentFilterRules,
    QbittorrentTorrentState,
    rawTorrent,
} from "@/interfaces/BtClient/qbittorrent";

import axios, {AxiosResponse, Method} from 'axios'
import urljoin from 'url-join'
import {getRandomInt} from "@/plugins/common";

export const defaultQbittorrentConfig: QbittorrentTorrentClientConfig = {
    type: 'qbittorrent',
    name: 'qbittorrent',
    uuid: '0da0e93a-3f5f-4bdd-8f73-aaa006d14771',
    address: 'http://localhost:9091/',
    username: '',
    password: '',
    timeout: 60 * 1e3
};

export default class Qbittorrent implements TorrentClient {
    isLogin: boolean | null = null;
    lastLoginAt: number = 0;
    config: QbittorrentTorrentClientConfig;

    constructor(options: Partial<QbittorrentTorrentClientConfig> = {}) {
        this.config = {...defaultQbittorrentConfig, ...options}
    }

    async ping(): Promise<boolean> {
        const pong = await this.login();
        return pong.data === 'Ok.'
    }

    async login(): Promise<AxiosResponse> {
        const form = new FormData();
        form.append('username', this.config.username)
        form.append('password', this.config.password)

        return await axios.post(urljoin(this.config.address,'/api/v2', '/auth/login'), form, {
            timeout: this.config.timeout,
            withCredentials: true
        })
    }

    async request(method: Method, path: string,
                  params?: any, data?: any,
                  headers?: any): Promise<AxiosResponse> {
        // qbt 默认Session时长 3600s，这里取 600s
        // FIXME 是否每次操作都login一下好些？就像PTPP一样
        if (this.isLogin === null || Date.now() + 600 * 1e3 > this.lastLoginAt) {
            await this.login()
            this.lastLoginAt = Date.now()
        }

        return await axios.request({
            method: method,
            url: urljoin(this.config.address,'/api/v2', path),
            params: params,
            data: data,
            headers: headers,
            timeout: this.config.timeout,
            withCredentials: true
        })
    }

    async addTorrent(urls: string, options: Partial<QbittorrentAddTorrentOptions> | undefined): Promise<boolean> {
        const formData = new FormData()

        // 开始处理options
        options = options || {};

        // 处理链接
        if (urls.startsWith('magnet:') || !options.localDownload) {
            formData.append('urls', urls)
        } else if (options.localDownload) {
            const req = await axios.get(urls,{
                responseType: 'blob'
            })
            formData.append('torrents', req.data, String(getRandomInt(0, 4096)) + '.torrent')
        }
        delete options.localDownload

        // 将通用字段转成qbt字段
        if (options.savePath) {
            options.savepath = options.savePath
            delete options.savePath
        }

        if (options.label) {
            options.category = options.label
            delete options.label
        }

        if ('addAtPaused' in options) {
            options.paused = options.addAtPaused ? 'true' : 'false';
            delete options.addAtPaused
        }

        options.useAutoTMM = 'false';  // 关闭自动管理

        for (const [key, value] of Object.entries(options)) {
            // @ts-ignore
            formData.append(key, value);
        }

        const res = await this.request('POST', '/torrents/add', undefined, formData)
        return res.data == 'Ok.'
    }

    async getTorrentsBy(filter: QbittorrentTorrentFilterRules): Promise<QbittorrentTorrent[]> {
        if (filter.hashes) {
            filter.hashes = this._normalizeHashes(filter.hashes)
        }

        // 将通用项处理成qbt对应的项目
        if (filter.complete) {
            filter.filter = 'completed'
            delete filter.complete
        }

        const res = await this.request('GET', '/torrents/info', filter)
        return res.data.map((torrent: rawTorrent) => this._normalizeTorrent(torrent))
    }

    async getAllTorrents(): Promise<QbittorrentTorrent[]> {
        return await this.getTorrentsBy({})
    }

    async getTorrent(id: any): Promise<QbittorrentTorrent> {
        const resp = await this.getTorrentsBy({
            hashes: id
        })

        return resp[0]
    }

    async pauseTorrent(hashes: string | string[] | 'all'): Promise<boolean> {
        const params = {
            hashes: this._normalizeHashes(hashes),
        };

        await this.request('GET', '/torrents/pause', params);
        return true;
    }

    async removeTorrent(hashes: any, removeData: boolean = false): Promise<boolean> {
        const params = {
            hashes: this._normalizeHashes(hashes),
            removeData,
        };
        await this.request('GET', '/torrents/delete', params);
        return true;
    }

    async resumeTorrent(hashes: string | string[] | 'all'): Promise<any> {
        const params = {
            hashes: this._normalizeHashes(hashes),
        };
        await this.request('GET', '/torrents/resume', params);
        return true;
    }

    _normalizeHashes(hashs: string | string[]): string {
        if (Array.isArray(hashs)) {
            return hashs.join('|')
        }
        return hashs
    }

    _normalizeTorrent(torrent: rawTorrent): QbittorrentTorrent {
        let state = TorrentState.unknown;

        switch (torrent.state) {
            case QbittorrentTorrentState.ForcedDL:
            case QbittorrentTorrentState.MetaDL:
                state = TorrentState.downloading;
                break;
            case QbittorrentTorrentState.Allocating:
                // state = 'stalledDL';
                state = TorrentState.queued;
                break;
            case QbittorrentTorrentState.ForcedUP:
                state = TorrentState.seeding;
                break;
            case QbittorrentTorrentState.PausedDL:
                state = TorrentState.paused;
                break;
            case QbittorrentTorrentState.PausedUP:
                // state = 'completed';
                state = TorrentState.paused;
                break;
            case QbittorrentTorrentState.QueuedDL:
            case QbittorrentTorrentState.QueuedUP:
                state = TorrentState.queued;
                break;
            case QbittorrentTorrentState.CheckingDL:
            case QbittorrentTorrentState.CheckingUP:
            case QbittorrentTorrentState.QueuedForChecking:
            case QbittorrentTorrentState.CheckingResumeData:
            case QbittorrentTorrentState.Moving:
                state = TorrentState.checking;
                break;
            case QbittorrentTorrentState.Unknown:
            case QbittorrentTorrentState.MissingFiles:
                state = TorrentState.error;
                break;
            default:
                break;
        }

        const isCompleted = torrent.progress === 1;

        return {
            id: torrent.hash,
            infoHash: torrent.hash,
            name: torrent.name,
            state,
            dateAdded: new Date(torrent.added_on * 1000).toISOString(),
            isCompleted,
            progress: torrent.progress,
            label: torrent.category,
            savePath: torrent.save_path,
            totalSize: torrent.total_size,
            ratio: torrent.ratio
        };
    }
}