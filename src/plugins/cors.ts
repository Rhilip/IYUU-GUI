import electron from "electron";

const session = electron.remote.session
session.defaultSession.webRequest.onBeforeSendHeaders({
  urls: ['*://*/*']
}, (details, callback) => {
  // @ts-ignore
  details.requestHeaders.Origin = null;
  // eslint-disable-next-line prefer-destructuring
  details.requestHeaders.Host = details.url.split('://')[1].split('/')[0]
  callback({
    requestHeaders: details.requestHeaders
  })
})