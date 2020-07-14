import _ from 'lodash'

export default function validCookies(raw: string) {
    const editCookiesKeys = [
        "domain", "expirationDate", "httpOnly", "name", "path",
        "sameSite", "secure", "session", "storeId", "value", "id"
    ]

    try {
        let cookies = JSON.parse(raw)
        if (!Array.isArray(cookies) || cookies.length === 0) {
            return false
        } else {
            for (let i = 0; i < cookies.length; i++) {
                if (!_.every(editCookiesKeys, _.partial(_.has, cookies[i]))) {
                    return false
                }
            }
        }
    } catch (e) {
        if (e instanceof SyntaxError) {
            // 说明可能是 {key}={value}; 形式

            // ["c_secure_uid=xxxxxx", "c_secure_pass=xxxxx", xxxxxxx, "__cfduid=xxxxxxx"]
            let cookies = raw.match(/(([^=; ]+)=([^=; ]+))/ig)
            if (!Array.isArray(cookies)) {
                return false
            }
        }
    }

    return true
}