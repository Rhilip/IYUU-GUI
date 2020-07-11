import Vue from 'vue'
import Router from 'vue-router'
import {Notification} from 'element-ui'

import store from '../store'

Vue.use(Router)

const router = new Router({
  routes: [
    // 用户登录部分
    {
      path: '/login',
      name: 'Login',
      component: require('../components/TokenLogin').default
    },

    // 概览部分
    {
      path: '/',
      name: 'Layer',
      component: require('../components/Layer').default,
      meta: {
        requiresLogin: true
      },
      children: [
        // 概览部分
        {
          path: 'status',
          name: 'Status',
          component: require('../components/Status').default,
          meta: {content: '概览'}
        },
        {
          path: 'mission',
          name: 'Mission',
          component: require('../components/Mission').default,
          meta: {content: '启动任务'}
        },

        // 软件设置部分
        {
          path: 'setting/site',
          name: 'Setting/Site',
          component: require('../components/Setting/Site').default,
          meta: {content: '辅种站点设置'}
        },
        {
          path: 'setting/btclient',
          name: 'Setting/BtClient',
          component: require('../components/Setting/BtClient').default,
          meta: {content: '下载器设置'}
        },
        {
          path: 'setting/other',
          name: 'Setting/Other',
          component: require('../components/Setting/Other').default,
          meta: {content: '其他设置'}
        },
        {
          path: 'setting/backup',
          name: 'Setting/Backup',
          component: require('../components/Gratitude/Declare').default,
          meta: {content: '参数备份与恢复'}
        },

        // 鸣谢部分
        {
          path: 'gratitude/declare',
          name: 'Declare',
          component: require('../components/Gratitude/Declare').default,
          meta: {content: '项目说明'}
        },
        {
          path: 'gratitude/donate',
          name: 'Donate',
          component: require('../components/Gratitude/Donate').default,
          meta: {content: '捐赠支持'}
        }
      ]
    },

    // Miss路由时
    {
      path: '*',
      redirect: '/status'
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresLogin) && !store.state.IYUU.token) {
    Notification.error({
      title: '未登录，返回登录窗口'
    })
    next('/login')
  } else {
    next()
  }
})

export default router
