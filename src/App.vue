<template>
  <div id="">
    <TheNavbar />
    <div class="container">
     <router-view/>
    </div>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar'
export default {
  components: {
    TheNavbar
  }
  // ,name: 'app'
}
</script>

<style>
@import "assets/css/style.css";
</style>
