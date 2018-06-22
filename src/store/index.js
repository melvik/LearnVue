import Vue from 'vue'
import Vuex from 'vuex'
import sourceData from '@/data'
import {countObjectProperties} from '@/utils'
Vue.use(Vuex)

const makeAppendChildToParrentMutation = ({parent, child}) =>
  (state, {childId, parentId}) => {
    const resource = state[parent][parentId] // == user.name === user['name']
    if (!resource[child]) {
      Vue.set(resource, child, {})
    }
    Vue.set(resource[child], childId, childId)
  }

export default new Vuex.Store({
  state: {
    ...sourceData,
    authId: 'jUjmgCurRRdzayqbRMO7aTG9X1G2'
  },
  getters: {
    authUser (state) {
      return state.users[state.authId]
    },
    userThreadsCount: state => id => countObjectProperties(state.users[id].threads),
    userPostsCount: state => id => countObjectProperties(state.users[id].posts),
    // ^^
    // userPostsCount (state) {
    //   return function (id) {
    //     return countObjectProperties(state.users[id].posts)
    //   }
    // }
    threadRepliesCount: state => id => countObjectProperties(state.threads[id].posts) - 1
  },
  actions: {
    createPost ({ commit, state }, post) {
      const postId = 'greatPost' + Math.random()
      post['.key'] = postId
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setPost', {post, postId})
      commit('appendPostToThread', {parentId: post.threadId, childId: postId})
      commit('appendPostToUser', {parentId: post.userId, childId: postId})
      return Promise.resolve(state.posts[postId])
    },
    updatePost ({state, commit}, {id, text}) {
      return new Promise((resolve, reject) => {
        const post = state.posts[id]
        commit('setPost', {
          postId: id,
          post: {
            ...post,
            text,
            edited: {
              at: Math.floor(Date.now() / 1000),
              by: state.authId
            }
          }
        })
        resolve(post)
      })
    },
    updateUser ({commit}, user) {
      commit('setUser', {userId: user['.key'], user})
    },
    createThread ({ state, commit, dispatch }, { text, title, forumId }) {
      return new Promise((resolve, reject) => {
        const threadId = 'greatThread' + Math.random()
        const userId = state.authId
        const publishedAt = Math.floor(Date.now() / 1000)
        const thread = {'.key': threadId, title, forumId, publishedAt, userId}
        commit('setThread', { threadId, thread })
        commit('appendThreadToForum', {parentId: forumId, childId: threadId})
        commit('appendThreadToUser', {parentId: userId, childId: threadId})
        dispatch('createPost', { text, threadId })
          .then(post => {
            commit('setThread', { threadId, thread: {...thread, firstPostId: post['.key']} })
          })
        resolve(state.threads[threadId])
      })
    },
    updateThread ({state, commit}, {title, text, id}) {
      return new Promise((resolve, reject) => {
        const thread = state.threads[id]
        const post = state.posts[thread.firstPostId]
        const newThread = { ...thread, title }
        const newPost = { ...post, text }

        commit('setThread', { thread: newThread, threadId: id })
        commit('setPost', {post: newPost, postId: thread.firstPostId})
        resolve(newThread)
      })
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
    appendPostToThread: makeAppendChildToParrentMutation({parent: 'threads', child: 'posts'}),
    // ^^ replaced with higher order func
    // appendPostToThread (state, {postId, threadId}) {
    //   const thread = state.threads[threadId]
    //   if (!thread.posts) {
    //     Vue.set(thread, 'posts', {})
    //   }
    //   Vue.set(thread.posts, postId, postId)
    //   // ^- this.$set(this.thread.posts, postId, postId)
    // },
    appendPostToUser: makeAppendChildToParrentMutation({parent: 'users', child: 'posts'}),
    // ^^ replaced with higher order func
    // appendPostToUser (state, {postId, userId}) {
    //   const user = state.users[userId]
    //   if (!user.posts) {
    //     Vue.set(user, 'posts', {})
    //   }
    //   Vue.set(user.posts, postId, postId)
    //   // ^- this.$set(this.$store.state.users[post.userId].posts, postId, postId)
    // },
    appendThreadToForum: makeAppendChildToParrentMutation({parent: 'forums', child: 'threads'}),
    // ^^ replaced with higher order func
    // appendThreadToForum (state, {forumId, threadId}) {
    //   const forum = state.forums[forumId]
    //   if (!forum.posts) {
    //     Vue.set(forum, 'threads', {})
    //   }
    //   Vue.set(forum.threads, threadId, threadId)
    // },
    appendThreadToUser: makeAppendChildToParrentMutation({parent: 'users', child: 'threads'})
    // ^^ replaced with higher order func
    // appendThreadToUser (state, {threadId, userId}) {
    //   const user = state.users[userId]
    //   if (!user.threads) {
    //     Vue.set(user, 'threads', {})
    //   }
    //   Vue.set(user.threads, threadId, threadId)
    // }
  }
})
