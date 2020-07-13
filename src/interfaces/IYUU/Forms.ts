// http://api.iyuu.cn/docs.php?service=App.User.Login&detail=1&type=fold
export interface userLoginForm {
    token: string,
    site: string,
    id: string,
    passkey: string,
}