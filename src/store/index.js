import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import categories from './modules/categories'
import forums from './modules/forums'
import threads from './modules/threads'
import posts from './modules/posts'
import users from './modules/users'
import auth from './modules/auth'
// import sourceData from '@/data' >> using real DB

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  getters,
  actions,
  mutations,
  modules: {
    categories,
    forums,
    threads,
    posts,
    users,
    auth
  }
})
