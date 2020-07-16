// 存放一些公共方法

import {shell} from 'electron'
import {LogInfo} from "@/interfaces/store";
import dayjs from "dayjs";

export async function shellOpen(href: string) {
    await shell.openExternal(href)
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

export function formatLogs(logs: LogInfo[]) {
    return logs
        .map(log => `${dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${log.message}`)  // 对象整理成字符串
        .join('\n')  // 用 \n 分割
}