import firebase from 'firebase'

export default {
  namespaced: true,
  state: {
    authId: null,
    unsubescribeAuthObserver: null
  },
  getters: {
    authUser (state, getters, rootState) {
      return state.authId ? rootState.users.items[state.authId] : null
    }
  },
  actions: {
    registerUserWithEmailandPassword ({dispatch}, {email, name, username, password, avatar = null}) {
      return firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(user => {
          return dispatch('users/createUser', {id: user.user.uid, email, name, username, password, avatar}, {root: true}) // auth/users/createUser
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
            return dispatch('users/fetchUser', {id: userId}, {root: true})
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
            return dispatch('users/createUser', {id: user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL}, {root: true})
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
    }
  },
  mutations: {
    setAuthId (state, id) {
      state.authId = id
    },
    setUnsubescribeAuthObserver (state, unsubscribe) {
      state.unsubescribeAuthObserver = unsubscribe
    }
  }
}
