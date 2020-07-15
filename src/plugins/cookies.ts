import _ from 'lodash'
import cookieParser from 'cookie'
import {session} from 'electron'

export default class Cookies {
    private static editCookiesKeys : string[] = [
        "domain", "expirationDate", "httpOnly", "name", "path",
        "sameSite", "secure", "session", "storeId", "value", "id"
    ]

    static parseCookies(raw: string): { [key: string]: string } {
        if (raw.match(/^\[/)) {
            // 如果开头是 [ ，我们认为是 editCookies 导出的结构
            let cookies = JSON.parse(raw)
            if (cookies.length === 0) {
                throw new TypeError('Zero Cookies Length')
            } else {
                let out: { [key: string]: string } = {}
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i]
                    if (!_.every(this.editCookiesKeys, _.partial(_.has, cookies[i]))) {
                        throw new TypeError('Some key miss in EditCookies export cookies')
                    }
                    out[cookie.name] = cookie.value
                }
                return out
            }
        } else {
            // 不然，我们认为是 {key}={value}; 形式，直接使用 cookieParser
            return  cookieParser.parse(raw)
        }
    }

    static validCookies(raw: string): Boolean {
        try {
            this.parseCookies(raw)
        } catch (e) {
            return false
        }
        return true
    }

    // 对 Electron 的 Cookies 对象 wrapper
    static async getCookies(filter: Electron.CookiesGetFilter): Promise<Electron.Cookie[]> {
        return session.defaultSession.cookies.get(filter)
    }

    static async setCookie(cookie: Electron.CookiesSetDetails): Promise<void> {
        return session.defaultSession.cookies.set(cookie)
    }

    static async removeCookie(url: string, name: string): Promise<void> {
        return session.defaultSession.cookies.remove(url, name)
    }

    // 在wrapper基础上扩展
    static async setCookiesByUrlAndCookiejar(url:string, cookiejar: { [key: string]: string }): Promise<void> {
        for (const [key, value] of Object.entries(cookiejar)) {
            await this.setCookie({
                url: url,
                name: key,
                value: value
            })
        }
    }

}