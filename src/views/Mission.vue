<template>
    <div>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>启动任务</b>
            </div>
            <div>
                <el-row>
                    <el-col :span="4">
                        <el-button type="warning"
                                   :disabled="missionState.processing"
                                   @click="test">
                            辅种任务
                        </el-button>
                    </el-col>
                    <el-col :span="20">
                        为添加的下载器和站点进行批量辅种任务，你可以在点击后的设置对话框里进一步设置启用站点。
                    </el-col>
                </el-row>
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>任务日志</b>
                <div v-if="logId !== ''" style="float: right">
                    <transition v-if="missionState.processing" name="el-fade-in-linear">
                        <i v-show="showBreathIcon" class="transition-box el-icon-warning-outline" style="color: #2b92d4" />
                    </transition>
                    <i v-else class="el-icon-circle-check" style="color:#16cd3d;" />
                    {{ missionState.processing ? '正在运行' : '运行完成' }}，运行id： {{ logId }}
                </div>
            </div>
            <div>
                <el-scrollbar>
                    <div style="height: 330px">
                        <pre v-if="logId !== ''">{{ formatLogs(logs) }}</pre>
                    </div>
                </el-scrollbar>
            </div>
        </el-card>
    </div>
</template>

<script>
  import Reseed from '../plugins/mission/reseed'
  import dayjs from 'dayjs'
  import _ from 'lodash'

  export default {
    name: 'Mission',
    data() {
      return {
        logs: [],
        showBreathIcon: true,
      }
    },

    computed: {
      missionState: function () {
        return this.$store.state.Mission.currentMission
      },
      logId: function () {
        return this.missionState.logId
      }
    },

    mounted() {
      if (this.logId) {
        this.deepUpdateLog()
      }
    },

    methods: {
      cleanMission() {
        this.logs = []
        this.showBreathIcon = true
      },

      deepUpdateLog() {
        this.logs = _.clone(this.$store.getters['Mission/logByLogId'](this.logId))
      },

      startBreathTimer() {
        this.breathTimerId = setInterval(() => {
            this.showBreathIcon = !this.showBreathIcon
        }, 1e3)
      },

      cleanBreathTimer() {
        clearTimeout(this.breathTimerId)
        this.breathTimerId = null
      },

      startMissionProcessTimer() {
        this.missionProcessTimer = setInterval(() => {
          this.deepUpdateLog()
        }, 1e3)
      },

      cleanMissionProcessTimer() {
        clearTimeout(this.missionProcessTimer)
        this.missionProcessTimer = null
      },

      test() {
        this.cleanMission()

        Reseed.start(this.$store.state.IYUU.enable_sites, this.$store.state.IYUU.enable_clients, (logId) => {
          this.logId = logId
          this.startMissionProcessTimer()
          this.startBreathTimer()
        }).then(() => {
          this.deepUpdateLog()
          this.cleanMissionProcessTimer()
          this.cleanBreathTimer()
          this.showBreathIcon = true
        })
      },

      formatLogs(logs) {
        return logs
          .map(log => `${dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')} ${log.message}`)  // 对象整理成字符串
          .join('\n')  // 用 \n 分割
      }
    }
  }
</script>

<style scoped>
    .log-card > .el-card__body {
        background-color: rgb(0, 0, 0);
        padding: 10px;
        height: 300px;
    }
</style>
