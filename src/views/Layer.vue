<template>
    <el-container>
        <Aside />
        <el-main>
            <el-page-header :content="$route.meta.content" @back="goBack" />
            <router-view />
        </el-main>
    </el-container>
</template>

<script>
import Aside from '../components/Aside'
export default {
  name: 'Layer',
  components: { Aside },
  methods: {
    goBack () {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
    .el-page-header {
        margin-bottom: 15px;
    }
</style>

<style>
    .main-card {
        margin-bottom: 10px;
    }
</style>
