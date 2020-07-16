<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'Iyuu',
    created() {
      this.$store.commit('Status/appStart')
    }
  }
</script>

<style>
  body {background-color:#f6f6f6}
</style>
