module.exports = {
  pluginOptions: {
    electronBuilder: {

      // refs: https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#configuring-electron-builder
      // refs: https://www.electron.build/configuration/configuration
      builderOptions: {
        appId: "info.rhilip.iyuu",
        productName: 'IYUU GUI',
        copyright: 'Copyright © 2020-2030 Rhilip',

        "nsis": {
          "deleteAppDataOnUninstall": true
        },
        publish: ['github']
      },

      // refs: https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/683
      nodeIntegration: true,

      // refs: https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/configuration.html#typescript-options
      disableMainProcessTypescript: false, // Manually disable typescript plugin for main process. Enable if you want to use regular js for the main process (src/background.js by default).
      mainProcessTypeChecking: false, // Manually enable type checking during webpck bundling for background file.

      // If you are using Yarn Workspaces, you may have multiple node_modules folders
      // List them all here so that VCP Electron Builder can find them
      nodeModulesPath: ['../../node_modules', './node_modules']
    }
  },

  // refs: https://github.com/championswimmer/vuex-module-decorators#using-with-target-es5
  transpileDependencies: ['vuex-module-decorators']
}