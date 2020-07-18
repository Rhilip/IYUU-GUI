// 此处为构建统一的下载器模型提供可能

export interface TorrentClient {
    config: TorrentClientConfig;

    ping: () => Promise<boolean>;

    getAllTorrents: () => Promise<Torrent[]>
    getTorrentsBy: (filter: TorrentFilterRules) => Promise<Torrent[]>
    getTorrent: (id: any) => Promise<Torrent>;

    addTorrent: (url: string, options?: Partial<AddTorrentOptions>) => Promise<boolean>;
    pauseTorrent: (id: any) => Promise<boolean>;
    resumeTorrent: (id: any) => Promise<boolean>;
    removeTorrent: (id: any, removeData?: boolean) => Promise<boolean>;
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
    id: string | number;
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
    ids?: any;
    complete?: boolean;
}

export interface AddTorrentOptions {
    /**
     * 是否本地下载
     */
    localDownload: boolean;

    /**
     * 是否将种子置于暂停状态
     */
    addAtPaused: boolean;

    /**
     * 种子下载地址
     */
    savePath: string;

    /**
     * called a label in some clients and a category in others
     * Notice: Some clients didn't support it
     */
    label?: string;
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

