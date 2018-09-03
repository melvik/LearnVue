import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/PageHome'
import ThreadShow from '@/pages/PagethreadShow'
import ThreadCreate from '@/pages/PageThreadCreate'
import ThreadEdit from '@/pages/PageThreadEdit'
import Forum from '@/pages/PageForum'
import Category from '@/pages/PageCategory'
import NotFound from '@/pages/PageNotFound'
import Profile from '@/pages/PageProfile'
import Register from '@/pages/PageRegister'
import SignIn from '@/pages/PageSignin'
import store from '@/store'

Vue.use(Router)

const router = new Router({
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
      props: true,
      meta: {requiresAuth: true}
    },
    {
      path: '/me/edit',
      name: 'ProfileEdit',
      component: Profile,
      props: {edit: true},
      meta: {requiresAuth: true}
    },
    {
      path: '/thread/create/:forumId',
      name: 'ThreadCreate',
      component: ThreadCreate,
      props: true,
      meta: {requiresAuth: true}
    },
    {
      path: '/thread/:id/edit',
      name: 'ThreadEdit',
      component: ThreadEdit,
      props: true,
      meta: {requiresAuth: true}
    },
    {
      path: '/thread/:id',
      name: 'ThreadShow',
      component: ThreadShow,
      props: true
    },
    {
      path: '/register',
      name: 'Register',
      meta: {requiresGuest: true},
      component: Register
    },
    {
      path: '/signin',
      name: 'SignIn',
      meta: {requiresGuest: true},
      component: SignIn
    },
    {
      path: '/logout',
      name: 'SignOut',
      meta: {requiresAuth: true},
      beforeEnter (to, from, next) {
        store.dispatch('signOut')
          .then(() => next({name: 'Home'}))
      }
    },
    {
      path: '*',
      name: 'NotFound',
      component: NotFound
    }
  ]
  // mode: 'history'
})

router.beforeEach((to, from, next) => {
  console.log(`Navigating to ${to.name} from ${from.name}`)
  // console.log(to.matched)
  // if (to.meta.requiresAuth) { OLD replaced with below
  store.dispatch('auth/initAuthentication')
  .then(user => {
    if (to.matched.some(route => route.meta.requiresAuth)) { // check nested routes too
      if (user) {
        next()
      } else {
        next({name: 'SignIn', query: { redirectTo: to.path }})
      }
    } else if (to.matched.some(route => route.meta.requiresGuest)) { // check nested routes too
      if (!user) {
        next()
      } else {
        next({name: 'Home'}) // or next('/')
      }
    } else {
      next()
    }
  })
})

export default router
