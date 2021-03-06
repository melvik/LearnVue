// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import firebase from 'firebase'
import App from './App'
import router from './router'
import AppDate from '@/components/AppDate'
import store from '@/store'
Vue.component('AppDate', AppDate)

Vue.config.productionTip = false

  // Initialize Firebase
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
}
firebase.initializeApp(config)
// MOVED TO actions
// firebase.auth().onAuthStateChanged(user => {
//   if (user) {
//     store.dispatch('fetchAuthUser')
//   }
// })

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
  // beforeCreate () {
  //   store.dispatch('fetchUser', {id: store.state.authId})
  // }
})
