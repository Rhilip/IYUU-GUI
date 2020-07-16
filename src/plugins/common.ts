// 存放一些公共方法

import {shell} from 'electron'

export async function shellOpen(href: string) {
    await shell.openExternal(href)
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}