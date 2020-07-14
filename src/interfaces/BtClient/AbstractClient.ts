// 此处为构建统一的下载器模型提供可能

export interface TorrentClient {
    config: TorrentClientConfig;

    ping: () => Promise<boolean>;

    getAllTorrents: () => Promise<Torrent[]>
    getTorrentsBy: (filter: TorrentFilterRules) => Promise<Torrent[]>
    getTorrent: (id: any) => Promise<Torrent>;

    addTorrent: (url: string, options?: Partial<AddTorrentOptions>) => Promise<any>;
    pauseTorrent: (id: any) => Promise<any>;
    resumeTorrent: (id: any) => Promise<any>;
    removeTorrent: (id: any, removeData?: boolean) => Promise<any>;
}

export type clientType = 'qbittorrent' | 'transmission' | 'deluge' | 'rtorrent'

export interface TorrentClientConfig {
    /**
     * The uuid of client, it's automatically generate by uuid4 when add client
     */
    uuid: string;

    type: clientType;

    /**
     * The name of client which can help users recognise it quickly
     */
    name: string;

    /**
     * The full url of torrent client webapi, like:
     *    - transmission:  http://ip:port/transmission/rpc
     *    - qbittorrent:   http://ip:port/
     */
    address: string;

    username?: string;
    password?: string;

    /**
     * request timeout
     */
    timeout?: number;
}

export interface Torrent {
    id: string|number;
    infoHash: string;

    name: string;

    /**
     * progress percent out of 100
     */
    progress: number;
    isCompleted: boolean;

    /**
     * 1:1 is 1, half seeded is 0.5
     */
    ratio: number;

    /**
     * date as iso string
     */
    dateAdded: string;

    savePath: string;
    label?: string;
    state: TorrentState;

    /**
     * total size of the torrent, in bytes
     */
    totalSize: number;
}

export interface TorrentFilterRules {

}

export interface AddTorrentOptions {
    /**
     * 是否本地下载
     */
    localDownload: boolean;

    /**
     * called a label in some clients and a category in others
     * Notice: Some clients didn't support it
     */
    label: string;
}

export enum TorrentState {
    downloading = 'downloading',
    seeding = 'seeding',
    paused = 'paused',
    queued = 'queued',
    checking = 'checking',
    error = 'error',
    unknown = 'unknown',
}

