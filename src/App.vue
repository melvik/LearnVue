<template>
  <div id="">
    <TheNavbar />
    <div class="container">
     <router-view :key="$router.path" v-show="showPage" @ready="pageReady"/>
     <Spinner v-show="!showPage" />
    </div>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar'
import Spinner from '@/components/AppSpinner'
import NProgress from 'nprogress'
export default {
  components: {
    TheNavbar,
    Spinner
  },
  data () {
    return {
      showPage: false
    }
  },
  methods: {
    pageReady () {
      this.showPage = true
      NProgress.done()
    }
  },
  created () {
    NProgress.configure({
      speed: 500,
      showSpinner: false
    })
    this.$router.beforeEach((to, from, next) => {
      this.showPage = false
      NProgress.start()
      next()
    })
  }
  // ,name: 'app'
}
</script>

<style>
@import "assets/css/style.css";
@import '~nprogress/nprogress.css';
</style>
