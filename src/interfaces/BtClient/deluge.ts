import {TorrentFilterRules} from "@/interfaces/BtClient/AbstractClient";


export type DelugeMethod =
    'auth.login' | 'web.update_ui' | 'core.get_torrents_status' |
    'core.add_torrent_url' | 'core.add_torrent_file' |
    'core.remove_torrent' | 'core.pause_torrent' | 'core.resume_torrent'

export interface DelugeDefaultResponse {
    /**
     * mostly usless id that increments with every request
     */
    id: number;
    error: null | string;
    result: any;
}

export type DelugeTorrentField =
    "comment"
    | "active_time"
    | "is_seed"
    | "hash"
    | "upload_payload_rate"
    | "move_completed_path"
    | "private"
    | "total_payload_upload"
    | "paused"
    | "seed_rank"
    | "seeding_time"
    | "max_upload_slots"
    | "prioritize_first_last"
    | "distributed_copies"
    | "download_payload_rate"
    | "message"
    | "num_peers"
    | "max_download_speed"
    | "max_connections"
    | "compact"
    | "ratio"
    | "total_peers"
    | "total_size"
    | "total_wanted"
    | "state"
    | "file_priorities"
    | "max_upload_speed"
    | "remove_at_ratio"
    | "tracker"
    | "save_path"
    | "progress"
    | "time_added"
    | "tracker_host"
    | "total_uploaded"
    | "files"
    | "total_done"
    | "num_pieces"
    | "tracker_status"
    | "total_seeds"
    | "move_on_completed"
    | "next_announce"
    | "stop_at_ratio"
    | "file_progress"
    | "move_completed"
    | "piece_length"
    | "all_time_download"
    | "move_on_completed_path"
    | "num_seeds"
    | "peers"
    | "name"
    | "trackers"
    | "total_payload_download"
    | "is_auto_managed"
    | "seeds_peers_ratio"
    | "queue"
    | "num_files"
    | "eta"
    | "stop_ratio"
    | "is_finished"
    | "label"  // if they don't have the label plugin it shouldn't fail

export interface DelugeRawTorrent {
    hash: string,
    name: string,
    progress: number,
    ratio: number,
    time_added: number,
    save_path: string,
    'label'?: string,
    state: 'Downloading' | 'Seeding' | 'Active' | 'Paused' | 'Queued' | 'Checking' | 'Error',
    'total_size': number
}

export interface DelugeTorrentFilterRules extends TorrentFilterRules {
    hash?: string,
    state?: string
}


export interface DelugeBooleanStatus extends DelugeDefaultResponse {
    result: boolean;
}