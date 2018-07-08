<template>

  <div v-if="ready" class="col-full push-top">
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
import {mapActions} from 'vuex'
import CategoryList from '@/components/CategoryList'
// console.log(sourceData)
export default {
  components: {
    // ForumList,
    CategoryList
    // ThreadList
  },
  data () {
    return {
      ready: false
    }
  },
  computed: {
    categories () {
      return Object.values(this.$store.state.categories)
    }
  },
  methods: {
    ...mapActions(['fetchAllCategories', 'fetchForums'])
  },
  created () {
    // original beforeCreate - changed for vuex MapActions
    console.log('beforeCreate', this.categories)
    this.fetchAllCategories()
    .then(categories => Promise.all(categories.map(category => this.fetchForums({ids: Object.keys(category.forums)})))
    .then(() => {
      this.ready = true
    })
    )
  },
  // created () {
  //   console.log('created', this.categories)
  // },
  beforeMount () {
    // console.log('beforeMount', this.categories)
  },
  mounted () {
    // = ready in JQ
    // console.log('Mount', this.categories, this.$el)
  },
  beforeDestroy () {
    // turn off listeners like firebase
    // console.log('beforeDestroy', this.categories)
  },
  destroyed () {
    // console.log('Destroy', this.categories)
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
