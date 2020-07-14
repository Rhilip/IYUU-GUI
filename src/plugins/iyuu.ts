import crypto from 'crypto'
import axios, {AxiosInstance} from 'axios'
import {Notification} from 'element-ui'

import store from '@/store'
import {userLoginForm} from '@/interfaces/IYUU/Forms'

class IyuuEndpoint {
    private instance: AxiosInstance;
    private apiPoint = 'https://api.iyuu.cn/';

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

    // 用户登录绑定操作
    userLogin(userLoginForm: userLoginForm) {
        // 要求合作站点用户密钥进行sha1操作 sha1(passkey)
        userLoginForm.passkey = crypto.createHash('sha1').update(userLoginForm.passkey).digest('hex')

        return new Promise((resolve, reject) => {
            this.instance.get('/user/login', {
                params: userLoginForm
            }).then(resp => {
                const data = resp.data
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
    apiSites(userLoginFrom: userLoginForm|null = null) {
        let sign: string;
        if (userLoginFrom === null) {
            // @ts-ignore
            sign = store.state.IYUU.token
        } else {
            sign = userLoginFrom.token
        }

        return new Promise((resolve, reject) => {
            this.instance.get('/api/sites', {
                params: {
                    sign: sign
                }
            }).then(resp => {
                const data = resp.data

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
}


export default new IyuuEndpoint()