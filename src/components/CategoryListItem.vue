<template>
        <div class="forum-list">
              <h2 class="list-title">
                <router-link 
                  :to="{name: 'Category', params: {id : category['.key']}}">
                  {{category.name}}
                </router-link>
                  <a href="#"></a>
              </h2>

              <ForumList 
                :forums="categoryForums"
              />

          </div>
</template>

<script>
// import ForumListItem from './ForumListItem'
import ForumList from './ForumList'
// import sourceData from '@/data'
export default {
  components: {
    // ForumListItem,
    ForumList
  },
  props: {
    category: {
      required: true,
      type: Object
    }
  },
  computed: {
    categoryForums () {
      return Object.values(this.$store.state.forums.items)
        .filter(forum => forum.categoryId === this.category['.key'])
    }
  }
}
</script>