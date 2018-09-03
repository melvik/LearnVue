<template>
    <div class="flex-grid">

        <UserProfileCart 
          v-if="!edit"
          :user="user"
        />

        <UserProfileCartEditor
          v-else
          :user="user"
        />
          <div class="col-7 push-top">
              <div class="profile-header">
                  <span class="text-lead">
                      {{user.username}}'s recent activity
                  </span>
                  <a href="#">See only started threads?</a>
              </div>

              <hr>

              <!-- <div class="activity-list">
                  <div class="activity">
                      <div class="activity-header">
                          <img src="https://www.sideshowtoy.com/photo_9030371_thumb.jpg" alt="" class="hide-mobile avatar-small">
                          <p class="title">
                              How can I chop onions without crying?
                              <span>Joker started a topic in Cooking</span>
                          </p>

                      </div>

                      <div class="post-content">
                        <div>
                          <p>I absolutely love onions, but they hurt my eyes! Is there a way where you can chop onions without crying?</p>
                        </div>
                      </div>

                      <div class="thread-details">
                          <span>4 minutes ago</span>
                          <span>1 comments</span>
                      </div>
                  </div>
              </div> -->

              <PostList :posts="userPosts" />
          </div>
      </div>
</template>

<script>
import PostList from '@/components/PostList'
import UserProfileCart from '@/components/UserProfileCart'
import UserProfileCartEditor from '@/components/UserProfileCartEditor'
import {mapGetters} from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
// import store from '@/store'

export default {
  props: {
    edit: {
      type: Boolean,
      default: false
    }
  },
  components: {
    PostList,
    UserProfileCart,
    UserProfileCartEditor
  },
  mixins: [asyncDataStatus],
  created () {
    this.$store.dispatch('posts/fetchPosts', {ids: this.user.posts})
    .then(() => this.asyncDataStatus_fetched())
    // this.$emit('ready')
  },
  computed: {
    ...mapGetters({
      user: 'auth/authUser'
    }),
    // moved to sub_cards as computed
    // userThreadsCount () {
    //   return this.$store.getters.userThreadsCount(this.user['.key'])
    // // return countObjectProperties(this.user.threads)
    // //   return this.user.threads ^^moved
    // //   ? Object.keys(this.user.threads).length
    // //   : 0
    // },
    // userPostsCount () {
    //   return this.$store.getters.userPostsCount(this.user['.key'])
    // //  return countObjectProperties(this.user.posts)
    // //   return this.user.posts
    // //   ? Object.keys(this.user.posts).length
    // //   : 0
    // },
    userPosts () {
      // if (this.user.posts) {
      //   return Object.values(this.$store.state.posts)
      //     .filter(post => post.userId === this.user['.key'])
      // }
      // return []
      // ^^ moved to getters
      return this.$store.getters['users/userPosts'](this.user['.key'])
    }
  }
  // beforeRouteEnter (to, from, next) {
  //   // if (store.state.authId) {
  //   //   next()
  //   // } else {
  //   //   next({name: 'Home'}) // or next('/')
  //   // }
  // },
  // beforeRouteUpdate (to, from, next) {
  //   // ... not implimented
  // },
  // beforeRouteLeave (to, from, next) {
  //   // ... not implimented
  // }
}
</script>
