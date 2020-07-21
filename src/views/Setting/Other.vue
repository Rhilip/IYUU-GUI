<template>
    <div>
        <el-card class="main-card">
            <el-tabs v-model="activeTabName" type="card">
                <el-tab-pane name="normal">
                    <template slot="label">
                        <i class="el-icon-s-tools" /> 常规设置
                    </template>
                    <Normal />
                </el-tab-pane>
                <el-tab-pane name="wechat">
                    <template slot="label">
                        <i class="el-icon-message-solid" /> 微信推送模板
                    </template>
                    // TODO 微信推送模板
                </el-tab-pane>
                <el-tab-pane label="其他" name="other">
                    // 此处请不要点击
                    <el-button type="warning"
                               @click="test">
                        点击测试
                    </el-button>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <br>
    </div>
</template>

<script>
import Normal from "../../components/Setting/Other/Normal";
import Cookies from "@/plugins/cookies";
export default {
  name: 'Other',
  components: {Normal},
  data() {
    return {
      activeTabName: 'normal'
    }
  },
  methods: {
    async test() {
      console.log(await Cookies.getCookies({
        domain: 'ob.rhilip.info'
      }))
    }

  }
}
</script>

<style scoped>

</style>
