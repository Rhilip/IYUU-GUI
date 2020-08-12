import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { Notification } from 'element-ui'

import {IYUUStore} from '@/store'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  // 用户登录部分
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },

  // 概览部分
  {
    path: '/',
    component: () => import('@/views/Layer.vue'),
    meta: {
      requiresLogin: true
    },
    children: [
      // 概览部分
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { content: '概览' }
      },
      {
        path: 'mission',
        name: 'Mission',
        component: () => import('@/views/Mission.vue'),
        meta: { content: '启动任务' }
      },

      // 软件设置部分
      {
        path: 'setting/site',
        name: 'Setting/Site',
        component: () => import('@/views/Setting/Site.vue'),
        meta: { content: '辅种站点设置' }
      },
      {
        path: 'setting/btclient',
        name: 'Setting/BtClient',
        component: () => import('@/views/Setting/BtClient.vue'),
        meta: { content: '下载器设置' }
      },
      {
        path: 'setting/other',
        name: 'Setting/Other',
        component: () => import('@/views/Setting/Other.vue'),
        meta: { content: '其他设置' }
      },
      {
        path: 'setting/backup',
        name: 'Setting/Backup',
        component: () => import('@/views/Setting/Backup.vue'),
        meta: { content: '参数备份与恢复' }
      },

      // 鸣谢部分
      {
        path: 'gratitude/declare',
        name: 'Declare',
        component: () => import('@/views/Gratitude/Declare.vue'),
        meta: { content: '项目说明' }
      },
      {
        path: 'gratitude/donate',
        name: 'Donate',
        component: () => import('@/views/Gratitude/Donate.vue'),
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

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // @ts-ignore
  if (to.matched.some(record => record.meta.requiresLogin) && !IYUUStore.token) {
    Notification.error('未登录，返回登录窗口')
    next('/login')
  } else {
    next()
  }
})

export default router
