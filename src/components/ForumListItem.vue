<template>
    <div class="forum-listing">
        <div class="forum-details">
            <router-link 
              :to="{name: 'Forum', params: {id : forum['.key']}}"
                  class="text-xlarge">
                  {{forum.name}}
            </router-link>
            <p>{{forum.description}}</p>
        </div>

        <div class="threads-count">
            <p class="count">{{threadCount}}</p> 
            {{threadCount === 1 ? 'thread' : 'threads'}}
        </div>

        <div class="last-thread">
            <!-- <img class="avatar" src="https://www.sideshowtoy.com/photo_9030371_thumb.jpg" alt="">
            <div class="last-thread-details">
                <a href="thread.html">Where is the sign in button?</a>
                <p class="text-xsmall">By <a href="profile.html">Joseph Kerr</a>, three hours ago</p>
            </div> -->
        </div>
    </div>
</template>

<script>
import {countObjectProperties} from '@/utils/index'

export default {
  props: {
    forum: {
      required: true,
      type: Object
    }
  },
  computed: {
    threadCount () {
      return countObjectProperties(this.forum.threads)
      // return this.forum.threads ? Object.values(this.forum.threads).length : 0
    }
  }
}
</script>
