// 存放一些公共方法

import {shell} from 'electron'

export async function shellOpen(href: string) {
    await shell.openExternal(href)
}
