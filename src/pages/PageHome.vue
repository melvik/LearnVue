<template>

  <div class="col-full push-top">
    <h1>Welcome to the Forum</h1>
    <!-- <ThreadList :threads="threads"/> -->
    <!-- <ForumList :forums="forums"/> -->
    <CategoryList :categories="categories" />
  </div>
</template>

<script>
// import sourceData from '@/data.json'
// import ThreadList from '@/components/ThreadList'
// import ForumList from '@/components/ForumList'
import CategoryList from '@/components/CategoryList'
// console.log(sourceData)
export default {
  components: {
    // ForumList,
    CategoryList
    // ThreadList
  },
  computed: {
    categories () {
      return Object.values(this.$store.state.categories)
    }
  }
  // data () {  data -> computed = best plactice
  //   return {
  //     // threads: Object.values(sourceData.threads),
  //     // forums: Object.values(sourceData.forums),
  //     categories: Object.values(this.$store.state.categories)
  //     // posts: sourceData.posts,
  //     // users: sourceData.users
  //   }
  // }
}
</script>
