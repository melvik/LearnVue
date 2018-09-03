import Vue from 'vue'
import firebase from 'firebase'
import {removeEmptyProperties, countObjectProperties} from '@/utils'
import {makeAppendChildToParrentMutation} from '@/store/assetHelpers'

export default {
  namespaced: true,
  state: {
    items: {}
  },
  getters: {
    userPosts: (state, getters, rootState) => id => {
      const user = state.items[id]
      if (user.posts) {
        return Object.values(rootState.posts.items)
          .filter(post => post.userId === id)
      }
      return []
    },
    userThreadsCount: state => id => countObjectProperties(state.items[id].threads),
    userPostsCount: state => id => countObjectProperties(state.items[id].posts)
    // ^^
    // userPostsCount (state) {
    //   return function (id) {
    //     return countObjectProperties(state.users[id].posts)
    //   }
    // }
  },
  actions: {
    updateUser ({commit}, user) {
      const updates = {
        avatar: user.avatar,
        username: user.username,
        name: user.name,
        bio: user.bio,
        website: user.website,
        email: user.email,
        location: user.location
      }
      return new Promise((resolve, reject) => {
        firebase.database().ref('users').child(user['.key']).update(removeEmptyProperties(updates))
        .then(() => {
          commit('setUser', {userId: user['.key'], user})
          resolve(user)
        })
      })
    },
    createUser ({state, commit}, {id, email, name, username, avatar = null}) {
      return new Promise((resolve, reject) => {
        const registeredAt = Math.floor(Date.now() / 1000)
        const usernameLower = username.toLowerCase()
        email = email.toLowerCase()
        const user = {avatar, email, name, username, usernameLower, registeredAt}
        // const userId = firebase.database().ref('users').push().key
        firebase.database().ref('users').child(id).set(user)
          .then(() => {
            commit('setItem', {resource: 'users', id: id, item: user}, {root: true})
            resolve(state.items[id])
          })
      })
    },
    fetchUsers: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'users', ids, itemType: '_Users'}, {root: true}),
    fetchUser: ({dispatch}, {id}) => dispatch('fetchItem', {id, itemType: 'User', resource: 'users'}, {root: true})
  },
  mutations: {
    setUser (state, {user, userId}) {
      Vue.set(state.users, userId, user)
    },
    appendThreadToUser: makeAppendChildToParrentMutation({parent: 'users', child: 'threads'}),
    // ^^ replaced with higher order func
    // appendThreadToUser (state, {threadId, userId}) {
    //   const user = state.users[userId]
    //   if (!user.threads) {
    //     Vue.set(user, 'threads', {})
    //   }
    //   Vue.set(user.threads, threadId, threadId)
    // }
    appendPostToUser: makeAppendChildToParrentMutation({parent: 'users', child: 'posts'})
    // ^^ replaced with higher order func
    // appendPostToUser (state, {postId, userId}) {
    //   const user = state.users[userId]
    //   if (!user.posts) {
    //     Vue.set(user, 'posts', {})
    //   }
    //   Vue.set(user.posts, postId, postId)
    // // ^- this.$set(this.$store.state.users[post.userId].posts, postId, postId)
    // },

  }
}
