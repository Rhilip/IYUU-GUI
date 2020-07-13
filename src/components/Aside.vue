<template>
    <el-aside :width="isCollapse ? '65px' : '220px'">
        <el-menu class="el-menu-vertical-aside" router
                 :default-active="$route.name" :collapse="isCollapse">
            <el-menu-item-group>
                <template slot="title">
                    <span>概览</span>
                </template>
                <el-menu-item index="Home" :route="{name: 'Home'}">
                    <i class="el-icon-menu" />
                    <span slot="title">概览</span>
                </el-menu-item>
                <el-menu-item index="Mission" :route="{name: 'Mission'}">
                    <i class="el-icon-s-promotion" />
                    <span slot="title">启动任务</span>
                </el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
                <template slot="title">
                    <span>设置</span>
                </template>
                <el-menu-item index="Setting/Site" :route="{name: 'Setting/Site'}">
                    <i class="el-icon-s-home" />
                    <span slot="title">辅种站点设置</span>
                </el-menu-item>
                <el-menu-item index="Setting/BtClient" :route="{name: 'Setting/BtClient'}">
                    <i class="el-icon-s-management" />
                    <span slot="title">下载器设置</span>
                </el-menu-item>
                <el-menu-item index="Setting/Ohter" :route="{name: 'Setting/Other'}">
                    <i class="el-icon-more" />
                    <span slot="title">其他设置</span>
                </el-menu-item>
                <el-menu-item index="Setting/Backup" :route="{name: 'Setting/Backup'}">
                    <i class="el-icon-s-tools" />
                    <span slot="title">参数备份与恢复</span>
                </el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
                <template slot="title">
                    <span>鸣谢</span>
                </template>
                <el-menu-item index="Declare" :route="{name: 'Declare'}">
                    <i class="el-icon-s-claim" />
                    <span slot="title">项目说明</span>
                </el-menu-item>
                <el-menu-item index="Donate" :route="{name: 'Donate'}">
                    <i class="el-icon-s-comment" />
                    <span slot="title">捐赠支持</span>
                </el-menu-item>
            </el-menu-item-group>
            <el-menu-item index="Collapse" style="margin-top: 40px" :route="{}" @click="toggleCollapse">
                <i :class="isCollapse ? 'el-icon-caret-right' : 'el-icon-caret-left'" />
                <span slot="title">{{ isCollapse ? '展开侧边栏' : '收起侧边栏' }}</span>
            </el-menu-item>
            <el-menu-item index="Logout" :route="{}" @click="logout">
                <i class="el-icon-user-solid" />
                <span slot="title">登出</span>
            </el-menu-item>
        </el-menu>
</el-aside>
</template>

<script>
export default {
  name: 'AsideMain',
  data () {
    return {
      isCollapse: true
    }
  },
  methods: {
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },

    logout () {
      this.$confirm('登出会导致站点设置和下载器设置丢失，如果你未备份设置，请考虑先进行参数导出操作。', '确认登出此Token？')
        .then(() => {
          this.$store.dispatch('IYUU/cleanToken').then(() => {
            this.$router.push('Login')
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
    .el-menu-vertical-aside {
        position: fixed;
    }

    .el-menu-vertical-aside:not(.el-menu--collapse) {
        width: 220px;
        min-height: 680px;
    }
</style>