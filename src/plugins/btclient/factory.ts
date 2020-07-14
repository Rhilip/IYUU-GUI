import {TorrentClient, TorrentClientConfig} from "@/interfaces/BtClient/AbstractClient";
import Qbittorrent from "@/plugins/btclient/qbittorrent";

export default function (config: TorrentClientConfig): TorrentClient {
    switch (config.type) {
        case "qbittorrent":
            return new Qbittorrent(config)
        case "deluge":
        case "rtorrent":
        case "transmission":
            return new Qbittorrent(config)  // FIXME
    }
}