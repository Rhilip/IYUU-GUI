<template>
    <el-aside width="230px">
        <el-menu>
            <el-menu-item-group>
                <template slot="title">
                    <span>概览</span>
                </template>
                <el-menu-item index="1-1">
                    <i class="el-icon-menu" />
                    <span slot="title">概览</span>
                </el-menu-item>
                <el-menu-item index="1-2">
                    <i class="el-icon-s-promotion" />
                    <span slot="title">启动任务</span>
                </el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
                <template slot="title">
                    <span>软件设置</span>
                </template>
                <el-menu-item index="2-1">
                    <span><i class="el-icon-s-home" />辅种站点设置</span>
                </el-menu-item>
                <el-menu-item index="2-2">
                    <span><i class="el-icon-s-management" />下载器设置</span>
                </el-menu-item>
                <el-menu-item index="2-3">
                    <span><i class="el-icon-s-tools" />参数备份与恢复</span>
                </el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
                <template slot="title">
                    <span>鸣谢</span>
                </template>
                <el-menu-item index="3-1">
                    <span><i class="el-icon-s-claim" />项目说明</span>
                </el-menu-item>
                <el-menu-item index="3-2">
                    <span><i class="el-icon-location" />捐赠支持</span>
                </el-menu-item>
            </el-menu-item-group>
            <el-menu-item index="7" disabled />
            <el-menu-item index="8" @click="logout">
                <span><i class="el-icon-user-solid" />登出</span>
            </el-menu-item>
        </el-menu>
</el-aside>
</template>

<script>
export default {
  name: 'AsideMain',
  methods: {
    logout () {
      this.$confirm('登出会导致站点设置和下载器设置丢失，如果你未备份设置，请考虑进行导出操作。', '确认登出此Token？')
        .then(_ => {
          this.$store.dispatch('IYUU/clearToken').then(() => {
            this.$router.push('Login')
          })
        })
        .catch(_ => {})
    }
  }
}
</script>

<style scoped>

</style>
