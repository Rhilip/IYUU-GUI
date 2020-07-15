<template>
    <div>
        <el-row type="flex" justify="space-around" style="margin-bottom: 10px">
            <el-col :span="4">
                <el-card class="state-card">
                    <p class="state-card-header">
                        启动
                    </p>
                    <p class="state-card-body">
                        {{ $store.state.startAppCount }}
                        <span class="state-card-body-perpand">
                            次
                        </span>
                    </p>
                </el-card>
            </el-col>
            <el-col :span="5">
                <el-card class="state-card">
                    <p class="state-card-header">
                        任务运行
                    </p>
                    <p class="state-card-body">
                        {{ $store.state.startMissionCount }}
                        <span class="state-card-body-perpand">
                            次
                        </span>
                    </p>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card class="state-card">
                    <p class="state-card-header">
                        站点
                    </p>
                    <p class="state-card-body">
                        {{ $store.getters['IYUU/signedSites'].length }}
                        <span class="state-card-body-perpand">
                            / {{ $store.state.IYUU.sites.length }}
                        </span>
                    </p>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card class="state-card">
                    <p class="state-card-header">
                        下载器
                    </p>
                    <p class="state-card-body">
                        {{ $store.getters['IYUU/signedBtClient'].length }}
                    </p>
                </el-card>
            </el-col>
            <el-col :span="5">
                <el-card class="state-card">
                    <p class="state-card-header">
                        辅种
                    </p>
                    <p class="state-card-body">
                        {{ $store.state.reseedTorrentCount }}
                        <span class="state-card-body-perpand">
                            个
                        </span>
                    </p>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
  name: 'Status',

  data() {
    return {
    }
  },
  async created() {
  }
}
</script>

<style scoped>
    .state-card > .el-card__body {
        padding: 10px;
    }

    .state-card-body {
        font-size: xx-large;
        text-align: center;
    }

    .state-card-body-perpand {
        color: #909399;
        font-size: small;
    }

    .state-card-header {
        color: #909399;
        margin: 0;
    }
</style>
