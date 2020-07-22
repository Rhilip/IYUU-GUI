import _ from 'lodash'
import UUID from 'uuid'
// @ts-ignore 这个库暂时还没有Typescript支持
import jsonar from 'jsonar'
import FileSaver from 'file-saver'

import {EnableSite} from "@/interfaces/IYUU/Site";
import {TorrentClientConfig} from "@/interfaces/BtClient/AbstractClient";
import {IYUUStore, MissionStore, StatusStore} from "@/store";

const packageInfo = require('../../package.json')

// 从JSON字段中解析，解析失败返回空对象
function decodeFromJsonString(text: string) {
    try {
        return JSON.parse(text);
    } catch (e) {
        return {}
    }
}

export class IYUUAutoReseedBridge {
    // 入口方法，内部根据字符串信息判断是使用jsonar库解析PHP Array还是JSON解析
    public static decodeFromFile(file: File) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = (e) => {
                // @ts-ignore
                const content: string = e.target.result

                let parsedConfig;
                if (content.indexOf('<?php') > -1) {
                    parsedConfig = this.decodeFromPHPArrayString(content)
                } else {
                    parsedConfig = decodeFromJsonString(content)
                }

                if (parsedConfig['iyuu.cn'] === IYUUStore.token) {
                    resolve(parsedConfig)
                } else {
                    reject('配置项未通过检验，或你传入文件中的爱语飞飞令牌与当前登录的不符。')
                }
            }
            r.readAsText(file);
        })
    }

    // 从PHPArray中解析，解析失败返回空对象
    private static decodeFromPHPArrayString(phpConfigRaw: string) {
        const returnFlag = phpConfigRaw.indexOf('return')
        const toParsePhpConfig = phpConfigRaw.slice(returnFlag + 6);   // return及之前全部忽略
        try {
            return jsonar.parse(toParsePhpConfig);
        } catch (e) {
            return {}
        }
    }

    public static importFromJSON(config: any) {
        let clientCount = 0;
        let siteCount = 0;

        const clients: any[] = config.default.clients;
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i]
            // 构造config
            let mergedClientConfig: TorrentClientConfig = {
                type: client.type.toLowerCase(),
                name: client.type,
                uuid: UUID.v4(),
                address: client.host,
                username: client.username,
                password: client.password,
                timeout: (client.type === 'transmission' ? 60 * 2 : 60) * 1e3
            }

            // 通过地址判断是不是有重复
            if (IYUUStore.enable_clients.findIndex(c => c.address === mergedClientConfig.address) === -1) {
                IYUUStore.addEnableClient(mergedClientConfig)
                clientCount++
            }
        }

        // 遍历我们的未添加sites列表
        for (let j = 0; j < IYUUStore.unsignedSites.length; j++) {
            let site = IYUUStore.unsignedSites[j]
            let mergedSiteConfig: EnableSite = _.merge(site,{
                cookies: "",
                download_torrent: false,
                link: "",
                rate_limit: {maxRequests: 0, requestsDelay: 0},
            })
            if (site.site in config) {
                const siteConfigFromPHP = config[site.site]

                // 如果没有cookies和passkey，直接跳过
                if (!siteConfigFromPHP.cookies && !siteConfigFromPHP.passkey) {
                    continue
                }

                mergedSiteConfig.cookies = siteConfigFromPHP.cookies
                mergedSiteConfig.download_torrent = IYUUStore.isForceDownloadSite(site.site)
                let link = IYUUStore.siteDownloadLinkTpl(site.site)
                if (siteConfigFromPHP.passkey) {
                    link = link.replace(/{passkey}/ig, siteConfigFromPHP.passkey)
                }
                if (siteConfigFromPHP.url_replace) {
                    for (const [key, value] of Object.entries(siteConfigFromPHP.url_replace)) {
                        if (typeof value === "string") {
                            link = link.replaceAll(key, value)
                        }
                    }
                }

                if (siteConfigFromPHP.url_join) {
                    link += (link.lastIndexOf('?') > -1 ? '&' : '?' ) + siteConfigFromPHP.url_join.join('&')
                }

                if (siteConfigFromPHP.limitRule) {
                    mergedSiteConfig.rate_limit.maxRequests = siteConfigFromPHP.limitRule.count || 0
                    mergedSiteConfig.rate_limit.requestsDelay = siteConfigFromPHP.limitRule.sleep || 0
                }

                if (!link.match(/({[^}]+?})/ig) && link.search('{}') > -1) {
                    mergedSiteConfig.link = link
                    IYUUStore.addEnableSite(mergedSiteConfig)
                    siteCount++
                }
            }
        }

        return {client: clientCount, site: siteCount}
    }
}

export class ConfigFileBridge {
    public static decodeFromFile(file:File) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = (e) => {
                // @ts-ignore
                const content: string = e.target.result

                let parsedConfig = decodeFromJsonString(content);

                if (parsedConfig['token'] === IYUUStore.token) {
                    resolve(parsedConfig)
                } else {
                    reject('配置项未通过检验，或你传入文件中的爱语飞飞令牌与当前登录的不符。')
                }
            }
            r.readAsText(file);
        })
    }

    public static importFromJSON(config: any) {
        IYUUStore.restoreFromConfig({
            token: config.token,
            sites: config.sites,
            clients: config.clients,
            apiPreInfoHash: config.config.apiPreInfoHash,
            maxRetry: config.config.maxRetry,
            weChatNotify: config.config.weChatNotify
        })
        StatusStore.restoreFromConfig({
            reseedTorrentCount: config.state.reseedTorrentCount,
            startAppCount: config.state.startAppCount,
            startMissionCount: config.state.startMissionCount,
        })
        MissionStore.restoreFromConfig({
            reseeded: config.hashes.reseeded
        })
    }

    public static exportToJSON() {
        const exportJSON =  {
            version: packageInfo.version,
            token: IYUUStore.token,
            sites: IYUUStore.enable_sites,
            clients: IYUUStore.enable_clients,
            state: {
                startAppCount: StatusStore.startAppCount,
                startMissionCount: StatusStore.startMissionCount,
                reseedTorrentCount: StatusStore.reseedTorrentCount
            },
            hashes: {
                reseeded: MissionStore.reseeded
            },
            config: {
                apiPreInfoHash: IYUUStore.apiPreInfoHash,
                maxRetry: IYUUStore.maxRetry,
                weChatNotify: IYUUStore.weChatNotify
            }
        }

        const blob = new Blob([JSON.stringify(exportJSON)], {
            type: "text/plain;charset=utf-8"
        })
        FileSaver.saveAs(blob, "iyuu_config.json");
    }
}