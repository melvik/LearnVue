import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/PageHome'
import threadShow from '@/pages/PagethreadShow'
import Forum from '@/pages/PageForum'
import Category from '@/pages/PageCategory'
import NotFound from '@/pages/PageNotFound'
import Profile from '@/pages/PageProfile'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/forum/:id',
      name: 'Forum',
      component: Forum,
      props: true
    },
    {
      path: '/category/:id',
      name: 'Category',
      component: Category,
      props: true
    },
    {
      path: '/me',
      name: 'Profile',
      component: Profile,
      props: true
    },
    {
      path: '/me/edit',
      name: 'ProfileEdit',
      component: Profile,
      props: {edit: true}
    },
    {
      path: '/thread/:id',
      name: 'threadShow',
      component: threadShow,
      props: true
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ],
  mode: 'history'
})
