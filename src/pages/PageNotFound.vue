<template>
    <div class="col-full centered" :class="$style.centered">
        <h1 :class="$style.headingLarge">Not Found</h1>
        <p :class="$style.textLarge">
            Opps...
            <router-link :to="{name: 'home'}">
                go to home page
            </router-link>
        </p>
    </div>
</template>

<script>
export default {
  created () {
    this.$emit('ready')
  }
}
</script>

<style module>
    .headingLarge{
        font-size: 100px;
    }
    .textLarge{
        font-size: 50px;
        font-weight: 100px;
    }
    .centered{
        text-align: center;
    }
</style>
