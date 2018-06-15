import Vue from 'vue'
import Vuex from 'vuex'
import sourceData from '@/data'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    ...sourceData,
    authId: 'jUjmgCurRRdzayqbRMO7aTG9X1G2'
  },
  getters: {
    authUser (state) {
      return state.users[state.authId]
    }
  },
  actions: {
    createPost ({commit, state}, post) {
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setPost', {post, postId})
      commit('appendPostToThread', {postId, threadId: post.threadId})
      commit('appendPostToUser', {postId, userId: post.userId})
    },
    updateUser ({commit}, user) {
      commit('setUser', {userId: user['.key'], user})
    },
    createThread ({ state, commit, dispatch }, { text, title, forumId }) {
      const threadId = 'greatThread' + Math.random()
      const userId = state.authId
      const publishedAt = Math.floor(Date.now() / 1000)
      const thread = {'.key': threadId, title, forumId, publishedAt, userId}
      commit('setThread', { threadId, thread })
      commit('appendThreadToForum', {forumId, threadId})
      commit('appendThreadToUser', {threadId, userId})
      dispatch('createPost', { text, threadId })
      // 'posts': {
      //   '-KvhfY9Xq81wRkrWOl1a': '-KvhfY9Xq81wRkrWOl1a'
      // },
    }
  },
  mutations: {
    setThread (state, {thread, threadId}) {
      Vue.set(state.threads, threadId, thread)
    },
    setUser (state, {user, userId}) {
      Vue.set(state.users, userId, user)
    },
    setPost (state, {post, postId}) {
      Vue.set(state.posts, postId, post)
      // ^- replace this.$set(this.$store.state.posts, postId, post)
    },
    appendPostToThread (state, {postId, threadId}) {
      const thread = state.threads[threadId]
      if (!thread.posts) {
        Vue.set(thread, 'posts', {})
      }
      Vue.set(thread.posts, postId, postId)
      // ^- this.$set(this.thread.posts, postId, postId)
    },
    appendPostToUser (state, {postId, userId}) {
      const user = state.users[userId]
      if (!user.posts) {
        Vue.set(user, 'posts', {})
      }
      Vue.set(user.posts, postId, postId)
      // ^- this.$set(this.$store.state.users[post.userId].posts, postId, postId)
    },
    appendThreadToForum (state, {forumId, threadId}) {
      const forum = state.forums[forumId]
      if (!forum.posts) {
        Vue.set(forum, 'threads', {})
      }
      Vue.set(forum.threads, threadId, threadId)
    },
    appendThreadToUser (state, {threadId, userId}) {
      const user = state.users[userId]
      if (!user.threads) {
        Vue.set(user, 'threads', {})
      }
      Vue.set(user.threads, threadId, threadId)
    }
  }
})
