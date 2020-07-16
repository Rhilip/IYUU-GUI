<template>
    <div>
        <el-row type="flex" justify="space-around" style="margin-bottom: 10px">
            <el-col :span="4">
                <StateCard title="启动" :data="$store.state.Status.startAppCount" prepend="次" />
            </el-col>
            <el-col :span="5">
                <StateCard title="任务运行" :data="$store.state.Status.startMissionCount" prepend="次" />
            </el-col>
            <el-col :span="4">
                <StateCard title="站点" :data="$store.getters['IYUU/signedSites'].length"
                           :prepend="`/ ${$store.state.IYUU.sites.length}`" />
            </el-col>
            <el-col :span="4">
                <StateCard title="下载器" :data="$store.getters['IYUU/signedBtClient'].length" />
            </el-col>
            <el-col :span="5">
                <StateCard title="辅种" :data="$store.state.Status.reseedTorrentCount" prepend="个" />
            </el-col>
        </el-row>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <span>公告栏</span>
            </div>
            <div>
                <el-table stripe :data="table">
                    <el-table-column
                            prop="date"
                            label="日期"
                            width="100"
                            align="center" />
                    <el-table-column
                            prop="content"
                            label="内容" />
                    <template slot="append">
                        以上仅为 IYUU-GUI 的更新公告，如需查询 IYUUAutoreseed 官方更新，请点击
                        <el-button type="text" @click="shellOpen('https://gitee.com/ledc/IYUUAutoReseed/blob/master/wiki/公告栏.md')">
                            IYUUAutoReseed / wiki / 公告栏.md
                        </el-button>
                    </template>
                </el-table>
            </div>
        </el-card>
    </div>
</template>

<script>
import StateCard from "../components/StateCard";
import {shellOpen} from "../plugins/common";

export default {
  name: 'Status',
  components: {StateCard},
  data() {
    return {
      shellOpen: shellOpen,
      table: []  // TODO 从Github上异步加载
    }
  },
  async created() {

  }
}
</script>

<style scoped>

</style>
