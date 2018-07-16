<template>
    <div v-if="asyncDataStatus_ready  " class='col-large push-top'>
      <h1>{{thread.title}}
        <router-link
        :to="{name: 'ThreadEdit', id:this.id}"
        class="btn-green btn-small"
        tag="button"
        >
          Edit thread
        </router-link>
      </h1>
        <p>
          By <a href='#' class='link-unstyled'>{{user.name}}</a>, <AppDate :timestamp='thread.publishedAt'/>.
          <span style='float:right; margin-top: 2px;' class='hide-mobile text-faded text-small'>{{repliesCount}} replies by {{contributorCount}} contributors</span>
        </p>
        <PostList :posts='posts'/>
        <PostEditor
          v-if="authUser"
          :threadId='id'
        />
      <div v-else class="text-center" style="margin-buttom: 50px;">
        <router-link :to="{name: 'SignIn', query: {redirectTo: $route.path}}">Sign in</router-link> or 
        <router-link :to="{name: 'Register', query: {redirectTo: $route.path}}">Register</router-link> to post a reply.
      </div>
    </div>
    
</template>
<script>
// import firebase from 'firebase'
import {mapActions, mapGetters} from 'vuex'
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import {countObjectProperties} from '@/utils/index'
import asyncDataStatus from '@/mixins/asyncDataStatus'
export default {
  components: {
    PostList,
    PostEditor
  },
  props: {
    id: {
      required: true,
      type: String
    }
  },
  mixins: [asyncDataStatus],
  // data () {
  //   return {
  //     // thread: this.$store.state.threads[this.id] removed for property DOWN
  //   }
  // },
  computed: {
    ...mapGetters({
      authUser: 'authUser'
    }),
    thread () {
      return this.$store.state.threads[this.id]
    },
    posts () {
      const postIds = Object.values(this.thread.posts)
      return Object.values(this.$store.state.posts).filter(post =>
        postIds.includes(post['.key']))
    },
    repliesCount () {
      return this.$store.getters.threadRepliesCount(this.thread['.key'])
    },
    user () {
      return this.$store.state.users[this.thread.userId]
    },
    contributorCount () {
      // // find the replies
      // const replies = Object.keys(this.thread.posts)
      //                 .filter(postId => postId !== this.thread.firstPostId)
      //                 .map(postId => this.$store.state.posts[postId])
      // // get the user ids
      // const userId = replies.map(post => post.userId)
      // // count the unique ids
      // return userId.filter((item, index) => userId.indexOf(item) === index).length
      return countObjectProperties(this.thread.contributors)
    }
  },
  methods: {
    ...mapActions(['fetchThread', 'fetchUser', 'fetchPosts'])
  },
  beforeCreate () {
    // this.id = undefined
  },
  created () {
    // prototype
    // fetch thread
    // firebase.database().ref('threads').child(this.id).once('value', snapshot => {
    //   const thread = snapshot.val()
    //   this.$store.commit('setThread', {threadId: snapshot.key, thread: {...thread, '.key': snapshot.key}})
    //   // fetch user
    //   firebase.database().ref('users').child(thread.userId).once('value', snapshot => {
    //     const user = snapshot.val()
    //     this.$store.commit('setUser', {userId: snapshot.key, user: {...user, '.key': snapshot.key}})
    //   })
    //
    //   Object.keys(thread.posts).forEach(postId => {
    //     // fetch post
    //     firebase.database().ref('posts').child(postId).once('value', snapshot => {
    //       const post = snapshot.val()
    //       this.$store.commit('setPost', {postId: snapshot.key, post: {...post, '.key': snapshot.key}})
    //
    //       // fetch user
    //       firebase.database().ref('users').child(post.userId).once('value', snapshot => {
    //         const user = snapshot.val()
    //         this.$store.commit('setUser', {userId: snapshot.key, user: {...user, '.key': snapshot.key}})
    //       })
    //     })
    //   })
    // })

    // fetch thread
    this.fetchThread({id: this.id})
      .then(thread => {
        // fetch user
        this.fetchUser({id: thread.userId})
        return this.fetchPosts({ids: Object.keys(thread.posts)})
      })
      .then(posts => {
        return Promise.all(posts.map(post => { this.fetchUser({id: post.userId}) }))
      .then(() => this.asyncDataStatus_fetched())

        // REPLACED WITH fetchPosts
        // Object.keys(thread.posts).forEach(postId => {
        //   // fetch post
        //   this.$store.dispatch('fetchPost', {id: postId})
        //   .then(post => {
        //     // fetch user
        //     this.$store.dispatch('fetchUser', {id: post.userId})
        //   })
        // })
      })
  }

  // methods: {
  //   addPost ({ post }) {
  //     // const postId = post['.key']

  //     // this.$set(this.$store.state.posts, postId, post)
  //     // this.$set(this.thread.posts, postId, postId)
  //     // this.$set(this.$store.state.users[post.userId].posts, postId, postId)
  //     // sets moved to store.index - mutations
  //     // console.log(eventData)
  //     this.$store.dispatch('createPost', post)
  //   }
  // }
}
</script>