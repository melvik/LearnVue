import firebase from 'firebase'

export default {
  createPost ({ commit, state }, post) {
    const postId = firebase.database().ref('posts').push().key // 'greatPost' + Math.random()
    // post['.key'] = postId
    post.userId = state.authId
    post.publishedAt = Math.floor(Date.now() / 1000)

    const updates = {}
    updates[`posts/${postId}`] = post
    updates[`threads/${post.threadId}/posts/${postId}`] = postId
    updates[`threads/${post.threadId}/contributors/${post.userId}`] = post.userId
    updates[`users/${post.userId}/posts/${postId}`] = postId
    firebase.database().ref().update(updates)
      .then(() => {
        commit('setItem', {resource: 'posts', item: post, id: postId}) // removed << commit('setPost', {post, postId})
        commit('appendPostToThread', {parentId: post.threadId, childId: postId})
        commit('appendContributorToThread', {parentId: post.threadId, childId: post.userId})
        commit('appendPostToUser', {parentId: post.userId, childId: postId})
        return Promise.resolve(state.posts[postId])
      })
  },
  updatePost ({state, commit}, {id, text}) {
    return new Promise((resolve, reject) => {
      const post = state.posts[id]
      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = {text, edited}
      firebase.database().ref('posts').child(id).update(updates)
        .then(() => {
          commit('setPost', {postId: id, post: { ...post, text, edited }})
          resolve(post)
        })
    })
  },
  updateUser ({commit}, user) {
    commit('setUser', {userId: user['.key'], user})
  },
  createThread ({ state, commit, dispatch }, { text, title, forumId }) {
    return new Promise((resolve, reject) => {
      const threadId = firebase.database().ref('threads').push().key // 'greatThread' + Math.random()
      const postId = firebase.database().ref('posts').push().key
      const userId = state.authId
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
          commit('setItem', {resource: 'threads', item: thread, id: threadId}) // replaced << commit('setThread', { threadId, thread })
          commit('appendThreadToForum', {parentId: forumId, childId: threadId})
          commit('appendThreadToUser', {parentId: userId, childId: threadId})

          commit('setItem', {resource: 'posts', item: post, id: postId}) // removed << commit('setPost', {post, postId})
          commit('appendPostToThread', {parentId: post.threadId, childId: postId})
          commit('appendPostToUser', {parentId: post.userId, childId: postId})
          resolve(state.threads[threadId])
        })

      commit('setItem', {resource: 'threads', item: thread, id: threadId}) // replaced << commit('setThread', { threadId, thread })
      commit('appendThreadToForum', {parentId: forumId, childId: threadId})
      commit('appendThreadToUser', {parentId: userId, childId: threadId})

      commit('setItem', {resource: 'posts', item: post, id: postId}) // removed << commit('setPost', {post, postId})
      commit('appendPostToThread', {parentId: post.threadId, childId: postId})
      commit('appendPostToUser', {parentId: post.userId, childId: postId})
      resolve(state.threads[threadId])
    })
  },
  updateThread ({state, commit}, {title, text, id}) {
    return new Promise((resolve, reject) => {
      const thread = state.threads[id]
      const post = state.posts[thread.firstPostId]
      const edited = {
        at: Math.floor(Date.now() / 1000),
        by: state.authId
      }

      const updates = {}
      updates[`posts/${thread.firstPostId}/text`] = text
      updates[`posts/${thread.firstPostId}/edited`] = edited
      updates[`threads/${id}/title`] = title
      firebase.database().ref().update(updates)
        .then(() => {
          commit('setThread', { thread: { ...thread, title }, threadId: id })
          commit('setPost', {post: { ...post, text }, postId: thread.firstPostId})
          resolve(post)
        })
    })
  },
  fetchThreads: ({dispatch}, {ids}) => dispatch('fetchItems', {ids, itemType: 'Thread', resource: 'threads'}),
  fetchForums: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'forums', ids, itemType: '_Forums'}),
  fetchUsers: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'users', ids, itemType: '_Users'}),
  fetchPosts: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'posts', ids, itemType: '_Post'}),
  fetchCategories: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'categories', ids, itemType: '_Categories'}),

  fetchThread: ({dispatch}, {id}) => dispatch('fetchItem', {id, itemType: 'Thread', resource: 'threads'}),
  fetchUser: ({dispatch}, {id}) => dispatch('fetchItem', {id, itemType: 'User', resource: 'users'}),
  fetchPost: ({dispatch}, {id}) => dispatch('fetchItem', {id, itemType: 'Post', resource: 'posts'}),
  fetchCategory: ({dispatch}, {id}) => dispatch('fetchItem', {id, resource: 'categories', itemType: '_catagory'}),
  fetchForum: ({dispatch}, {id}) => dispatch('fetchItem', {id, resource: 'forums', itemType: '_forum'}),

  fetchItem ({state, commit}, {id, itemType, resource}) {
    return new Promise((resolve, reject) => {
      firebase.database().ref(resource).child(id).once('value', snapshot => {
        commit('setItem', {resource, id: snapshot.key, item: snapshot.val()})
        // resolve(state[resource][id])
        setTimeout(() => resolve(state[resource][id]), 1000)
      })
    })
  },
  fetchItems ({dispatch}, {ids, resource, itemType}) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchItem', {id, resource, itemType})))
  },
  fetchAllCategories ({state, commit}) {
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
}
