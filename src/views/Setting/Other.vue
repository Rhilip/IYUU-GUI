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
                    <weChat />
                </el-tab-pane>
                <el-tab-pane label="其他" name="other">
                    <el-row>
                        <el-col :span="4">
                            <el-button type="warning"
                                       @click="openDevTools">
                                调试工具
                            </el-button>
                        </el-col>
                        <el-col :span="20">
                            打开调试工具（如果你确定是高手，或者想要观察软件是怎么工作的）<br>
                            那么你可以点击此处打开Developer Tools面板
                        </el-col>
                    </el-row>
                    <!--
                    <el-row>
                        <el-col :span="4">
                            <el-button type="warning"
                                       @click="text">
                                点击测试
                            </el-button>
                        </el-col>
                        <el-col :span="20">
                            这个没啥用，用来临时测试些方法时候正常的时候使用
                        </el-col>
                    </el-row>
                    -->
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <br>
    </div>
</template>

<script>
import {remote} from 'electron'
import Normal from "../../components/Setting/Other/Normal";
import WeChat from "../../components/Setting/Other/weChat";
export default {
  name: 'Other',
  components: {WeChat, Normal},
  data() {
    return {
      activeTabName: 'normal'
    }
  },
  methods: {
    openDevTools() {
      remote.getCurrentWebContents().openDevTools()
    },

    async test() {

    }
  }
}
</script>

<style scoped>

</style>
