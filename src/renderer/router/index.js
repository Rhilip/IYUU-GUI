import Vue from 'vue'
import Router from 'vue-router'
import { Notification } from 'element-ui'

import store from '../store'

Vue.use(Router)

const router = new Router({
  routes: [
    // 用户登录部分
    {
      path: '/login',
      name: 'Login',
      component: () => import('../components/TokenLogin')
    },

    // 概览部分
    {
      path: '/',
      component: () => import('../components/Layer'),
      meta: {
        requiresLogin: true
      },
      children: [
        // 概览部分
        {
          path: '',
          name: 'Status',
          component: () => import('../components/Status'),
          meta: { content: '概览' }
        },
        {
          path: 'mission',
          name: 'Mission',
          component: () => import('../components/Mission'),
          meta: { content: '启动任务' }
        },

        // 软件设置部分
        {
          path: 'setting/site',
          name: 'Setting/Site',
          component: () => import('../components/Setting/Site'),
          meta: { content: '辅种站点设置' }
        },
        {
          path: 'setting/btclient',
          name: 'Setting/BtClient',
          component: () => import('../components/Setting/BtClient'),
          meta: { content: '下载器设置' }
        },
        {
          path: 'setting/other',
          name: 'Setting/Other',
          component: () => import('../components/Setting/Other'),
          meta: { content: '其他设置' }
        },
        {
          path: 'setting/backup',
          name: 'Setting/Backup',
          component: () => import('../components/Setting/Backup'),
          meta: { content: '参数备份与恢复' }
        },

        // 鸣谢部分
        {
          path: 'gratitude/declare',
          name: 'Declare',
          component: () => import('../components/Gratitude/Declare'),
          meta: { content: '项目说明' }
        },
        {
          path: 'gratitude/donate',
          name: 'Donate',
          component: () => import('../components/Gratitude/Donate'),
          meta: { content: '捐赠支持' }
        }
      ]
    },

    // Miss路由时
    {
      path: '*',
      redirect: '/'
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
