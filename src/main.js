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
  apiKey: 'AIzaSyCpE5ncxcxWmjWzuLjc0ppw3dc-XLglTm4',
  authDomain: 'hovikvueschoolforum.firebaseapp.com',
  databaseURL: 'https://hovikvueschoolforum.firebaseio.com',
  projectId: 'hovikvueschoolforum',
  storageBucket: '',
  messagingSenderId: '852367972944'
}
firebase.initializeApp(config)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App },
  beforeCreate () {
    store.dispatch('fetchUser', {id: store.state.authId})
  }
})
