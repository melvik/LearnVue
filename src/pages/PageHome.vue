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
  },
  beforeCreate () {
    console.log('beforeCreate', this.categories)
    this.$store.dispatch('fetchAllCategories')
    .then(categories => {
      categories.forEach(category => this.$store.dispatch('fetchForums', {ids: Object.keys(category.forums)}))
    })
  },
  created () {
    console.log('created', this.categories)
  },
  beforeMount () {
    console.log('beforeMount', this.categories)
  },
  mounted () {
    // = ready in JQ
    console.log('Mount', this.categories, this.$el)
  },
  beforeDestroy () {
    // turn off listeners like firebase
    console.log('beforeDestroy', this.categories)
  },
  destroyed () {
    console.log('Destroy', this.categories)
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
