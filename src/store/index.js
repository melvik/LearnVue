import Vue from 'vue'
import Vuex from 'vuex'
// import sourceData from '@/data' >> using real DB
import firebase from 'firebase'
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
    categories: {},
    forums: {},
    posts: {},
    threads: {},
    users: {},
    authId: 'jUjmgCurRRdzayqbRMO7aTG9X1G2'
  },
  getters: {
    authUser (state) {
      return {}
      // return state.users[state.authId]
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
    },
    fetchThread ({dispatch}, {id}) {
      console.log('>> fetchThread >>', id)
      return dispatch('fetchItem', {id, itemType: 'Thread', resource: 'threads'})
      // return new Promise((resolve, reject) => {
      //   firebase.database().ref('threads').child(id).once('value', snapshot => {
      //     const thread = snapshot.val()
      //     commit('setThread', {threadId: snapshot.key, thread: {...thread, '.key': snapshot.key}})
      //     resolve(state.threads[id])
      //   })
      // })
    },
    fetchUser ({dispatch}, {id}) {
      console.log('>> fetchUser >>', id)
      return dispatch('fetchItem', {id, itemType: 'User', resource: 'users'})
      // return new Promise((resolve, reject) => {
      //   firebase.database().ref('users').child(id).once('value', snapshot => {
      //     const user = snapshot.val()
      //     commit('setUser', {userId: snapshot.key, user: {...user, '.key': snapshot.key}})
      //     resolve(state.users[id])
      //   })
      // })
    },
    fetchPost ({dispatch}, {id}) {
      console.log('>> fetchPost >>', id)
      return dispatch('fetchItem', {id, itemType: 'Post', resource: 'posts'})
      // return new Promise((resolve, reject) => {
      //   firebase.database().ref('posts').child(id).once('value', snapshot => {
      //     const post = snapshot.val()
      //     commit('setPost', {postId: snapshot.key, post: {...post, '.key': snapshot.key}})
      //     resolve(state.posts[id])
      //   })
      // })
    },
    fetchForums ({dispatch}, {ids}) {
      return dispatch('fetchItems', {resource: 'forums', ids, itemType: '_Forum'})
    },
    fetchPosts ({dispatch}, {ids}) {
      return dispatch('fetchItems', {resource: 'posts', ids, itemType: '_Post'})
    },
    fetchItem ({state, commit}, {id, itemType, resource}) {
      console.log('>> fetchItem >>', itemType, id)
      return new Promise((resolve, reject) => {
        firebase.database().ref(resource).child(id).once('value', snapshot => {
          commit('setItem', {resource, id: snapshot.key, item: snapshot.val()})
          resolve(state[resource][id])
        })
      })
    },
    fetchItems ({dispatch}, {ids, resource, itemType}) {
      return Promise.all(ids.map(id => dispatch('fetchItem', {id, resource, itemType})))
    },
    fetchAllCategories ({state, commit}) {
      console.log('>> fetchAllCategories >>')
      return new Promise((resolve, reject) => {
        firebase.database().ref('categories').once('value', snapshot => {
          const categoriesObject = snapshot.val()
          Object.keys(categoriesObject).forEach(categoryId => {
            const category = categoriesObject[categoryId]
            commit('setItem', {resource: 'categories', id: categoryId, item: category})
          })
          resolve(Object.values(state.categories))
        })
      })
    }
  },
  mutations: {
    setItem (state, {item, id, resource}) {
      item['.key'] = id
      Vue.set(state[resource], id, item)
    },
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
