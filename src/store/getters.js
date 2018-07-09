import {countObjectProperties} from '@/utils'
export default {
  authUser (state) {
    return state.authId ? state.users[state.authId] : null
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
}
