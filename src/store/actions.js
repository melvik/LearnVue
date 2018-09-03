import firebase from 'firebase'

export default {
  fetchItem ({state, commit}, {id, itemType, resource}) {
    return new Promise((resolve, reject) => {
      firebase.database().ref(resource).child(id).once('value', snapshot => {
        commit('setItem', {resource, id: snapshot.key, item: snapshot.val()})
        resolve(state[resource].items[id])
        // setTimeout(() => resolve(state[resource][id]), 100)
      })
    })
  },
  fetchItems ({dispatch}, {ids, resource, itemType}) {
    ids = Array.isArray(ids) ? ids : Object.keys(ids)
    return Promise.all(ids.map(id => dispatch('fetchItem', {id, resource, itemType})))
  }
}
