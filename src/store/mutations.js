import Vue from 'vue'

const makeAppendChildToParrentMutation = ({parent, child}) =>
  (state, {childId, parentId}) => {
    const resource = state[parent][parentId] // == user.name === user['name']
    if (!resource[child]) {
      Vue.set(resource, child, {})
    }
    Vue.set(resource[child], childId, childId)
  }

export default {
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
  setAuthId (state, id) {
    state.authId = id
  },
  setUnsubescribeAuthObserver (state, unsubscribe) {
    state.unsubescribeAuthObserver = unsubscribe
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
  appendContributorToThread: makeAppendChildToParrentMutation({parent: 'threads', child: 'contributors'}),
  appendPostToUser: makeAppendChildToParrentMutation({parent: 'users', child: 'posts'}),
  // ^^ replaced with higher order func
  // appendPostToUser (state, {postId, userId}) {
  //   const user = state.users[userId]
  //   if (!user.posts) {
  //     Vue.set(user, 'posts', {})
  //   }
  //   Vue.set(user.posts, postId, postId)
  // // ^- this.$set(this.$store.state.users[post.userId].posts, postId, postId)
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
