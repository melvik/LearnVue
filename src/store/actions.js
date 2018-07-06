import firebase from 'firebase'

export default {
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
        resolve(state[resource][id])
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
