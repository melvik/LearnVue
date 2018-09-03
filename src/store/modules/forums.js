import {makeAppendChildToParrentMutation} from '@/store/assetHelpers'

export default {
  namespaced: true,
  state: {
    items: {}
  },
  getters: {},
  actions: {
    fetchForums: ({dispatch}, {ids}) => dispatch('fetchItems', {resource: 'forums', ids, itemType: '_Forums'}, {root: true}),
    fetchForum: ({dispatch}, {id}) => dispatch('fetchItem', {id, resource: 'forums', itemType: '_forum'}, {root: true})
  },
  mutations: {
    appendThreadToForum: makeAppendChildToParrentMutation({parent: 'forums', child: 'threads'})
    // ^^ replaced with higher order func
    // appendThreadToForum (state, {forumId, threadId}) {
    //   const forum = state.forums[forumId]
    //   if (!forum.posts) {
    //     Vue.set(forum, 'threads', {})
    //   }
    //   Vue.set(forum.threads, threadId, threadId)
    // },
  }
}
