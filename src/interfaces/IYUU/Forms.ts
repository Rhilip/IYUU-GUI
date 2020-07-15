/**
 * 此文件对IYUU的相关API请求参数和相应参数进行描述
 *
 * 多数接口有简写地址：
 *   https://api.iyuu.cn/index.php?s=App.Api.Sites
 *   https://api.iyuu.cn/api/sites
 *
 * 命名规则示例：
 *   接口地址：http://api.iyuu.cn/index.php?s=App.Api.Notify
 *   其接口名为 App.Api.Notify
 *   则其接口请求参数命名为  apiNotifyRequest
 *      接口响应参数命名为  apiNotifyResponse 如果该接口范式，则必须继承 BaseResponse
 *
 */
import {Site} from "@/interfaces/IYUU/Site";

export interface BaseResponse {
    /**
     * 状态码，200表示成功，4xx表示客户端非法请求，5xx表示服务器错误
     *     - 400	ret=400，客户端参数错误或非法请求
     *     - 404	表示接口服务不存在
     *     - 406	ret=406，access_token令牌校验不通过
     *     - 407	ret=407，app_key权限不足，或未知应用
     *     - 408	ret=408，当前用户禁止使用，或用户未登录
     *     - 500	表示服务端内部错误
     */
    ret: number,

    /**
     * 业务数据，由各自接口指定，通常为对象
     */
    data: any,

    /**
     * 提示信息，失败时的错误提示
     */
    msg: string
}

export interface TorrentInfo {
    sid: number,
    torrent_id: number,
    info_hash: string
}

/**
 * @description 用户登录
 *              根据合作站点标识、ID、passkey、爱语飞飞Token进行登录操作
 * @url https://api.iyuu.cn/index.php?s=App.User.Login
 * @method GET
 * @docs https://api.iyuu.cn/docs.php?service=App.User.Login&detail=1&type=fold
 */
export interface userLoginRequest {
    token: string,
    site: string,
    id: string,
    passkey: string,
}

export interface userLoginResponse extends BaseResponse {
    /**
     * 注意一下，登录成功，data项才是这样，不然是个空字典
     * 但是由于Typescript的类型规定，导致使用 Partial<{ ... }> 还是 { ... } | {} 都会报编译错误，
     * 所以须先判断ret项
     */
    data: {
        /**
         * 是否登录成功true、失败false
         */
        success: boolean,

        /**
         * 	用户ID
         */
        user_id: number,

        /**
         * 这个目前文档没列出来，但是实际上有使用，返回格式
         * IYUU自动辅种工具：站点******,用户ID:***** 登录成功！
         */
        errmsg: string
    }
}


/**
 * @description 获取所有站点信息
 *              返回支持的站点列表
 * @url https://api.iyuu.cn/index.php?s=App.Api.Sites
 * @method GET
 * @docs https://api.iyuu.cn/docs.php?service=App.Api.Sites&detail=1&type=fold
 */
export interface apiSitesRequest {
    /**
     *	爱语飞飞Token
     */
    sign: string,

    /**
     * 客户端版本号
     *
     * 版本为空或低于v1.9.1会返回旧数据  { "download_page": "download.php?id={}" }
     * 其他情况返回新数据  { "download_page": "download.php?id={}&passkey={passkey}" }
     */
    version?: string
}

export interface apiSitesResponse extends BaseResponse {
    data: {
        sites: Site[]
    }
}

/**
 * @description 查询辅种
 *              返回所有辅种数据 infohash索引
 * @url http://api.iyuu.cn/index.php?s=App.Api.Infohash
 * @method POST
 * @docs http://api.iyuu.cn/docs.php?service=App.Api.Infohash&detail=1&type=fold
 */
export interface apiInfohashRequest {
    sign: string,
    timestamp: number,
    version: string,
    hash: string[],
    sha1: string  // sha1(hash)
}

export interface apiInfohashResponse extends BaseResponse {
    data: {
        [propName: string]: {
            torrent: TorrentInfo[]
        }
    }
}

/**
 * @description 查询辅种
 *              返回所有辅种数据 infohash索引
 * @url http://api.iyuu.cn/index.php?s=App.Api.Hash
 * @method POST
 * @docs http://api.iyuu.cn/docs.php?service=App.Api.Hash&detail=1&type=fold
 */
export interface apiHashRequest extends apiInfohashRequest {}

export interface apiHashResponse extends BaseResponse {
    data: {
        hash: string,
        torrent: TorrentInfo[]
    }[]
}

/**
 * @description 通知接口
 *               上报错误种子、异常状态等
 * @url http://api.iyuu.cn/index.php?s=App.Api.Notify
 * @method GET
 * @docs http://api.iyuu.cn/docs.php?service=App.Api.Notify&detail=1&type=fold
 */
export interface apiNotifyRequest {
    sigh: string,
    site: string,
    sid: number,
    torrent_id: number,
    error: string
}

export interface apiNotifyResponse extends BaseResponse {
    data: {
        success: boolean
    }
}