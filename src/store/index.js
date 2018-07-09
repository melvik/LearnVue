import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
// import sourceData from '@/data' >> using real DB
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    categories: {},
    forums: {},
    posts: {},
    threads: {},
    users: {},
    authId: null
  },
  getters,
  actions,
  mutations
})
