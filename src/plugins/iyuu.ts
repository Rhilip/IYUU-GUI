import crypto from 'crypto'
import axios, {AxiosInstance, AxiosResponse} from 'axios'
import {Notification} from 'element-ui'

import store from '@/store'
import * as Forms from '@/interfaces/IYUU/Forms'


function sha1(data: string | string[]) {
    if (Array.isArray(data)) {
        data = JSON.stringify(data)
    }
    return crypto.createHash('sha1').update(data).digest('hex')
}

function timestamp() {
    // @ts-ignore
    return parseInt(Date.now() / 1000)
}

class IyuuEndpoint {
    private instance: AxiosInstance;
    private apiPoint = 'https://api.iyuu.cn/';
    private version = '1.9.3'; // FAKE origin version

    constructor() {
        this.instance = axios.create({
            baseURL: this.apiPoint,
            transformResponse: [function (resp) {
                // 统一处理IYUU服务器返回信息
                // 不知道为什么，这里获得的data项不是JSON字典，而是JSON字符串，将其转换一下
                // 如果状态码不对，也统一报错
                const data = JSON.parse(resp)
                if (data.ret !== 200) {
                    Notification.error({
                        title: '服务器返回错误: ' + data.ret,
                        message: data.data.errmsg ? data.data.errmsg : data.msg
                    })
                }

                return data
            }]
        })
    }

    async sendWeChatMsg(text: string, desp: string|null = null): Promise<AxiosResponse> {
        const params = new URLSearchParams();
        params.append('text', text);
        if (desp) {
            params.append('desp', desp);
        }

        return await axios.post(`https://iyuu.cn/${store.state.IYUU.token}.send`,params)
    }

    // 用户登录绑定操作
    userLogin(userLoginForm: Forms.userLoginRequest): Promise<Forms.userLoginResponse> {
        // 要求对合作站点用户密钥进行sha1操作 sha1(passkey)
        userLoginForm.passkey = sha1(userLoginForm.passkey)

        return new Promise((resolve, reject) => {
            this.instance.get('/user/login', {
                params: userLoginForm
            }).then(resp => {
                const data: Forms.userLoginResponse = resp.data
                if (data.ret === 200) {
                    Notification.success({
                        title: '登录验证成功',
                        message: data.data.errmsg
                    })
                    store.dispatch('IYUU/setToken', userLoginForm.token).then(() => {
                        resolve(data)
                    })
                } else {
                    reject(data)
                }
            })
        })
    }

    // 获取所有站点支持列表
    apiSites(userLoginForm: Forms.userLoginRequest | null = null): Promise<Forms.apiSitesResponse> {
        let sign: string;
        if (userLoginForm === null) {
            // @ts-ignore
            sign = store.state.IYUU.token
        } else {
            sign = userLoginForm.token
        }

        return new Promise((resolve, reject) => {
            this.instance.get('/api/sites', {
                params: {
                    sign: sign,
                    version: this.version
                } as Forms.apiSitesRequest
            }).then(resp => {
                const data: Forms.apiSitesResponse = resp.data

                if (data.data.sites) {
                    Notification.success('从IYUU服务器获取站点数据成功')
                    store.dispatch('IYUU/updateSites', data.data.sites).then(() => {
                        resolve(data)
                    })
                } else {
                    // TODO cleanToken
                    reject(data)
                }
            })
        })
    }

    private _buildHashForm(infohash:string|string[]): Forms.apiInfohashRequest|Forms.apiHashRequest {
        // 强行转成列表
        if (typeof infohash === 'string') {
            infohash = [infohash]
        }

        return  {
            sign: store.state.IYUU.token,
            timestamp: timestamp(),
            version: this.version,
            // @ts-ignore
            hash: infohash,
            sha1: sha1(infohash),
        }
    }

    apiInfohash(infohash: string | string[]): Promise<Forms.apiInfohashResponse> {
        return new Promise(resolve => {
            this.instance.post('/api/infohash', this._buildHashForm(infohash)).then(resp => {
                const data: Forms.apiInfohashResponse = resp.data
                resolve(data)
            })
        })
    }

    apiHash(infohash: string|string[]): Promise<Forms.apiHashResponse> {
        return new Promise(resolve => {
            this.instance.post('/api/hash', this._buildHashForm(infohash)).then(resp => {
                const data: Forms.apiHashResponse = resp.data
                resolve(data)
            })
        })
    }

    apiNotify(info: {
        site: string,
        sid: number,
        torrent_id: number,
        error: string
    }): Promise<Forms.apiNotifyResponse>
    {
        const form: Forms.apiNotifyRequest = { sigh: store.state.IYUU.token, ...info }
        return new Promise<Forms.apiNotifyResponse>(resolve => {
            this.instance.get('/api/notify', {
                params: form
            }).then(resp => {
                const data: Forms.apiNotifyResponse = resp.data
                resolve(data)
            })
        })
    }
}

const iyuuEndpoint = new IyuuEndpoint()
Object.freeze(iyuuEndpoint)
export default iyuuEndpoint