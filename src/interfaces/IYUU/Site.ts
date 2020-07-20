export interface Site {
    id: number,
    site: string,
    base_url: string,
    download_page: string,
    is_https: number
}

export interface EnableSite extends Site {
    // 这两个应该在添加站点时启用
    link: string,
    cookies: string,

    // 剩下的应该在编辑站点时使用
    /**
     * 是否在本地客户端下载种子，然后发送种子内容到下载器
     */
    download_torrent: boolean,

    /**
     * 下载频率限制，只允许一组
     */
    rate_limit: {
        // 按总量
        maxRequests: number   // 单次运行推送总量
        requestsDelay: number  // 两次下载间隔
    }
}