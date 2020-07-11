import Vue from 'vue'
import Router from 'vue-router'
import {Notification} from 'element-ui'

import TokenLogin from '../components/TokenLogin'
import Main from '../components/Main'

import store from '../store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: TokenLogin
    },
    {
      path: '/',
      name: 'Main',
      component: Main,
      meta: {
        requiresLogin: true
      }
    },
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
