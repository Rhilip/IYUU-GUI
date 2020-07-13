import axios, {AxiosInstance} from 'axios'
import {Notification} from 'element-ui'

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
}


export default new IyuuEndpoint()