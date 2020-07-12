import Vue from 'vue'
import axios from 'axios'
import lodash from 'lodash'
import iyuu from './utils/iyuu'
import ElementUI from 'element-ui'

import App from './App'
import router from './router'
import store from './store'

import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

// 设置网络请求类，axios为默认请求应用，iyuu则进行简单包装
Vue.axios = Vue.prototype.$axios = axios
Vue.iyuu = Vue.prototype.$iyuu = iyuu

// 把lodash挂到Vue下
Vue.lodash = Vue.prototype.$lodash = lodash

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
