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
  div.form-notice{
    margin-top: 5px;
    font-size: 12px;
    color: #909399;
    line-height: 1.6;
  }
</style>
