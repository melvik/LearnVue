import firebase from 'firebase'

export default {
  namespaced: true,
  state: {
    items: {}
  },
  getters: {},
  actions: {
    fetchAllCategories ({state, commit}) {
      return new Promise((resolve, reject) => {
        firebase.database().ref('categories').once('value', snapshot => {
          const categoriesObject = snapshot.val()
          Object.keys(categoriesObject).forEach(categoryId => {
            const category = categoriesObject[categoryId]
            commit('setItem', {resource: 'categories', id: categoryId, item: category}, {root: true})
          })
          resolve(Object.values(state.items))
        })
      })
    },
    fetchCategories: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'categories', ids, itemType: '_Categories'}, {root: true}),
    fetchCategory: ({dispatch}, {id}) => dispatch('fetchItem', {id, resource: 'categories', itemType: '_catagory'}, {root: true})
  },
  mutations: {}
}
