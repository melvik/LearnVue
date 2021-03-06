import firebase from 'firebase'
import {removeEmptyProperties} from '@/utils'

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
  createUser ({state, commit}, {id, email, name, username, avatar = null}) {
    return new Promise((resolve, reject) => {
      const registeredAt = Math.floor(Date.now() / 1000)
      const usernameLower = username.toLowerCase()
      email = email.toLowerCase()
      const user = {avatar, email, name, username, usernameLower, registeredAt}
      // const userId = firebase.database().ref('users').push().key
      firebase.database().ref('users').child(id).set(user)
       .then(() => {
         commit('setItem', {resource: 'users', id: id, item: user})
         resolve(state.users[id])
       })
    })
  },
  registerUserWithEmailandPassword ({dispatch}, {email, name, username, password, avatar = null}) {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
      return dispatch('createUser', {id: user.user.uid, email, name, username, password, avatar})
    })
    .then(() => dispatch('fetchAuthUser'))
    // onAuthStateChanged in main.js is taking care of this .then(() => dispatch('fetchAuthUser'))
  },

  initAuthentication ({dispatch, commit, state}) {
    return new Promise((resolve, reject) => {
      if (state.unsubescribeAuthObserver) {
        state.unsubescribeAuthObserver()
      }
      const unsubscribe = firebase.auth().onAuthStateChanged(user => {
        console.log('user has changed')
        if (user) {
          dispatch('fetchAuthUser')
          .then((dbUser) => resolve(dbUser))
        } else {
          resolve(null)
        }
      })
      commit('setUnsubescribeAuthObserver', unsubscribe)
    })
  },

  fetchAuthUser ({dispatch, commit}) {
    const userId = firebase.auth().currentUser.uid
    return new Promise((resolve, reject) => {
      firebase.database().ref('users').child(userId).once('value', snapshot => {
        if (snapshot.exists()) {
          return dispatch('fetchUser', {id: userId})
          .then(user => {
            commit('setAuthId', userId)
            resolve(user)
          })
        } else {
          resolve(null)
        }
      })
    })
  },
  signinWithEmailAndPassword (context, {email, password}) {
    return firebase.auth().signInWithEmailAndPassword(email, password)
  },
  signinWithGoogle ({dispatch}) {
    const provider = new firebase.auth.GoogleAuthProvider()
    return firebase.auth().signInWithPopup(provider)
    .then(data => {
      const user = data.user
      firebase.database().ref('users').child(user.uid).once('value', snapshot => {
        if (!snapshot.exists()) {
          return dispatch('createUser', {id: user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL})
          .then(() => dispatch('fetchAuthUser'))
        }
      })
    })
  },
  signOut ({commit}) {
    return firebase.auth().signOut()
    .then(() => {
      commit('setAuthId', null)
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
        resolve(state[resource][id])
        // setTimeout(() => resolve(state[resource][id]), 100)
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
