import {
    AddTorrentOptions,
    Torrent,
    TorrentClientConfig,
    TorrentFilterRules
} from "@/interfaces/BtClient/AbstractClient";

type TrueFalseStr = 'true' | 'false';

export interface QbittorrentTorrent extends Torrent {
    id: string;
}


export interface QbittorrentTorrentClientConfig extends TorrentClientConfig {
    username: string;
    password: string;
}

export interface QbittorrentTorrentFilterRules extends TorrentFilterRules {
    hashes?: string|string[];
    filter?: QbittorrentTorrentFilters;
    category?: string;
    sort?: string;
    offset?: number;
    reverse?: boolean|TrueFalseStr;
}

export interface QbittorrentAddTorrentOptions extends AddTorrentOptions {
    /**
     * Download folder
     */
    savepath: string;
    /**
     * Cookie sent to download the .torrent file
     */
    cookie: string;
    /**
     * Category for the torrent
     */
    category: string;
    /**
     * 	Skip hash checking. Possible values are true, false (default)
     */
    skip_checking: TrueFalseStr;
    /**
     * Add torrents in the paused state. Possible values are true, false (default)
     */
    paused: TrueFalseStr;
    /**
     * Create the root folder. Possible values are true, false, unset (default)
     */
    root_folder: TrueFalseStr | null;
    /**
     * Rename torrent
     */
    rename: string;
    /**
     * Set torrent upload speed limit. Unit in bytes/second
     */
    upLimit: number;
    /**
     * Set torrent download speed limit. Unit in bytes/second
     */
    dlLimit: number;
    /**
     * Whether Automatic Torrent Management should be used, disables use of savepath
     */
    useAutoTMM: TrueFalseStr;
    /**
     * Enable sequential download. Possible values are true, false (default)
     */
    sequentialDownload: TrueFalseStr;
    /**
     * Prioritize download first last piece. Possible values are true, false (default)
     */
    firstLastPiecePrio: TrueFalseStr;
}

export type QbittorrentTorrentFilters =
    | 'all'
    | 'downloading'
    | 'completed'
    | 'paused'
    | 'active'
    | 'inactive'
    | 'resumed'
    | 'stalled'
    | 'stalled_uploading'
    | 'stalled_downloading';

export enum QbittorrentTorrentState {
    /**
     * Some error occurred, applies to paused torrents
     */
    Error = 'error',
    /**
     * Torrent is paused and has finished downloading
     */
    PausedUP = 'pausedUP',
    /**
     * Torrent is paused and has NOT finished downloading
     */
    PausedDL = 'pausedDL',
    /**
     * Queuing is enabled and torrent is queued for upload
     */
    QueuedUP = 'queuedUP',
    /**
     * Queuing is enabled and torrent is queued for download
     */
    QueuedDL = 'queuedDL',
    /**
     * Torrent is being seeded and data is being transferred
     */
    Uploading = 'uploading',
    /**
     * Torrent is being seeded, but no connection were made
     */
    StalledUP = 'stalledUP',
    /**
     * Torrent has finished downloading and is being checked; this status also applies to preallocation (if enabled) and checking resume data on qBt startup
     */
    CheckingUP = 'checkingUP',
    /**
     * Same as checkingUP, but torrent has NOT finished downloading
     */
    CheckingDL = 'checkingDL',
    /**
     * Torrent is being downloaded and data is being transferred
     */
    Downloading = 'downloading',
    /**
     * Torrent is being downloaded, but no connection were made
     */
    StalledDL = 'stalledDL',
    /**
     * Torrent is forced to downloading to ignore queue limit
     */
    ForcedDL = 'forcedDL',
    /**
     * Torrent is forced to uploading and ignore queue limit
     */
    ForcedUP = 'forcedUP',
    /**
     * Torrent has just started downloading and is fetching metadata
     */
    MetaDL = 'metaDL',
    /**
     * Torrent is allocating disk space for download
     */
    Allocating = 'allocating',
    QueuedForChecking = 'queuedForChecking',
    /**
     * Checking resume data on qBt startup
     */
    CheckingResumeData = 'checkingResumeData',
    /**
     * Torrent is moving to another location
     */
    Moving = 'moving',
    /**
     * Unknown status
     */
    Unknown = 'unknown',
    /**
     * Torrent data files is missing
     */
    MissingFiles = 'missingFiles',
}

export interface rawTorrent {
    /**
     * Torrent name
     */
    name: string;
    hash: string;
    magnet_uri: string;
    /**
     * datetime in seconds
     */
    added_on: number;
    /**
     * Torrent size
     */
    size: number;
    /**
     * Torrent progress
     */
    progress: number;
    /**
     * Torrent download speed (bytes/s)
     */
    dlspeed: number;
    /**
     * Torrent upload speed (bytes/s)
     */
    upspeed: number;
    /**
     * Torrent priority (-1 if queuing is disabled)
     */
    priority: number;
    /**
     * Torrent seeds connected to
     */
    num_seeds: number;
    /**
     * Torrent seeds in the swarm
     */
    num_complete: number;
    /**
     * Torrent leechers connected to
     */
    num_leechs: number;
    /**
     * Torrent leechers in the swarm
     */
    num_incomplete: number;
    /**
     * Torrent share ratio
     */
    ratio: number;
    /**
     * Torrent ETA
     */
    eta: number;
    /**
     * Torrent state
     */
    state: QbittorrentTorrentState;
    /**
     * Torrent sequential download state
     */
    seq_dl: boolean;
    /**
     * Torrent first last piece priority state
     */
    f_l_piece_prio: boolean;
    /**
     * Torrent copletion datetime in seconds
     */
    completion_on: number;
    /**
     * Torrent tracker
     */
    tracker: string;
    /**
     * Torrent download limit
     */
    dl_limit: number;
    /**
     * Torrent upload limit
     */
    up_limit: number;
    /**
     * Amount of data downloaded
     */
    downloaded: number;
    /**
     * Amount of data uploaded
     */
    uploaded: number;
    /**
     * Amount of data downloaded since program open
     */
    downloaded_session: number;
    /**
     * Amount of data uploaded since program open
     */
    uploaded_session: number;
    /**
     * Amount of data left to download
     */
    amount_left: number;
    /**
     * Torrent save path
     */
    save_path: string;
    /**
     * Amount of data completed
     */
    completed: number;
    /**
     * Upload max share ratio
     */
    max_ratio: number;
    /**
     * Upload max seeding time
     */
    max_seeding_time: number;
    /**
     * Upload share ratio limit
     */
    ratio_limit: number;
    /**
     * Upload seeding time limit
     */
    seeding_time_limit: number;
    /**
     * Indicates the time when the torrent was last seen complete/whole
     */
    seen_complete: number;
    /**
     * Last time when a chunk was downloaded/uploaded
     */
    last_activity: number;
    /**
     * Size including unwanted data
     */
    total_size: number;
    time_active: number;
    /**
     * Category name
     */
    category: string;
}