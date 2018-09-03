import {countObjectProperties} from '@/utils'
import firebase from 'firebase'
import Vue from 'vue'
import {makeAppendChildToParrentMutation} from '@/store/assetHelpers'

export default {
  namespaced: true,
  state: {
    items: {} // state.threads.items[id]
  },
  getters: {
    threadRepliesCount: state => id => countObjectProperties(state.items[id].posts) - 1
  },
  actions: {
    createThread ({ state, commit, dispatch, rootState }, { text, title, forumId }) {
      return new Promise((resolve, reject) => {
        const threadId = firebase.database().ref('threads').push().key // 'greatThread' + Math.random()
        const postId = firebase.database().ref('posts').push().key
        const userId = rootState.auth.authId
        const publishedAt = Math.floor(Date.now() / 1000)
        const thread = {title, forumId, publishedAt, userId, firstPostId: postId, posts: {}}
        thread.posts[postId] = postId
        const post = {text, publishedAt, threadId, userId}

        const updates = {}
        // set threads
        updates[`threads/${threadId}`] = thread
        // append to forum
        updates[`forums/${forumId}/threads/${threadId}`] = threadId
        // append to user
        updates[`users/${userId}/threads/${threadId}`] = threadId

        // POST
        updates[`posts/${postId}`] = post
        // updates[`threads/${threadId}/posts/${postId}`] = postId  >> bc Line 51
        updates[`users/${userId}/posts/${postId}`] = postId
        console.log('updates', updates)
        firebase.database().ref().update(updates)
        .then(() => {
          commit('setItem', {resource: 'threads', item: thread, id: threadId}, {root: true}) // replaced << commit('setThread', { threadId, thread })
          commit('forums/appendThreadToForum', {parentId: forumId, childId: threadId}, {root: true})
          commit('users/appendThreadToUser', {parentId: userId, childId: threadId}, {root: true})

          commit('setItem', {resource: 'posts', item: post, id: postId}) // removed << commit('setPost', {post, postId})
          commit('appendPostToThread', {parentId: post.threadId, childId: postId})
          commit('users/appendPostToUser', {parentId: post.userId, childId: postId}, {root: true})
          resolve(state.items[threadId])
        })
        // // commit('setItem', {resource: 'threads', item: thread, id: threadId}) // replaced << commit('setThread', { threadId, thread })
        // // commit('appendThreadToForum', {parentId: forumId, childId: threadId})
        // // commit('appendThreadToUser', {parentId: userId, childId: threadId})

        // // commit('setItem', {resource: 'posts', item: post, id: postId}) // removed << commit('setPost', {post, postId})
        // // commit('appendPostToThread', {parentId: post.threadId, childId: postId})
        // // commit('appendPostToUser', {parentId: post.userId, childId: postId})
        // // resolve(state.items[threadId])
      })
    },
    updateThread ({state, commit, rootState}, {title, text, id}) {
      return new Promise((resolve, reject) => {
        const thread = state.items[id]
        const post = rootState.posts.items[thread.firstPostId]
        const edited = {
          at: Math.floor(Date.now() / 1000),
          by: rootState.auth.authId
        }

        const updates = {}
        updates[`posts/${thread.firstPostId}/text`] = text
        updates[`posts/${thread.firstPostId}/edited`] = edited
        updates[`threads/${id}/title`] = title
        firebase.database().ref().update(updates)
        .then(() => {
          commit('setThread', { thread: { ...thread, title }, threadId: id })
          commit('posts/setPost', {post: { ...post, text }, postId: thread.firstPostId}, {root: true})
          resolve(post)
        })
      })
    },
    fetchThread: ({dispatch}, {id}) => dispatch('fetchItem', {id, itemType: 'Thread', resource: 'threads'}, {root: true}),
    fetchThreads: ({dispatch}, {ids}) => dispatch('fetchItems', {ids, itemType: 'Thread', resource: 'threads'}, {root: true})
  },
  mutations: {
    setThread (state, {thread, threadId}) {
      Vue.set(state.items, threadId, thread)
    },
    appendPostToThread: makeAppendChildToParrentMutation({parent: 'threads', child: 'posts'}),
    // ^^ replaced with higher order func
    // appendPostToThread (state, {postId, threadId}) {
    //   const thread = state.threads[threadId]
    //   if (!thread.posts) {
    //     Vue.set(thread, 'posts', {})
    //   }
    //   Vue.set(thread.posts, postId, postId)
    // // ^- this.$set(this.thread.posts, postId, postId)
    // },
    appendContributorToThread: makeAppendChildToParrentMutation({parent: 'threads', child: 'contributors'})
  }
}
