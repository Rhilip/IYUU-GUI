<template>
    <div>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>启动任务</b>
            </div>
            <div>
                <el-row>
                    <el-col :span="4">
                        <el-button type="success"
                                   :disabled="missionState.processing"
                                   @click="handlerReseedMissionDialogOpen">
                            辅种任务
                        </el-button>
                    </el-col>
                    <el-col :span="20">
                        为添加的下载器和站点进行批量辅种任务，你可以在点击后的设任务置对话框里进一步设置启用站点和下载服务器。
                    </el-col>
                </el-row>
                <el-row style="margin-top: 10px">
                    <el-col :span="4">
                        <el-button type="warning"
                                   :disabled="missionState.processing"
                                   @click="handlerTransferMission">
                            转种任务
                        </el-button>
                    </el-col>
                    <el-col :span="20">
                        // 还没开始写
                    </el-col>
                </el-row>
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>任务日志</b>
                <div v-if="logId !== '' && logs.length > 0" style="float: right">
                    <transition v-if="missionState.processing" name="el-fade-in-linear">
                        <i v-show="showBreathIcon" class="transition-box el-icon-warning-outline" style="color: #2b92d4" />
                    </transition>
                    <i v-else class="el-icon-circle-check" style="color:#16cd3d;" />
                    {{ missionState.processing ? '正在运行' : '运行完成' }}，运行id： {{ logId }}
                </div>
            </div>
            <div>
                <el-scrollbar>
                    <div style="height: 295px">
                        <pre v-if="logId !== ''">{{ formatLogs(logs) }}</pre>
                    </div>
                </el-scrollbar>
            </div>
        </el-card>

        <Reseed :is-visible="dialogReseedVisible" @close-mission-reseed-dialog="dialogReseedVisible = false" @start-reseed-mission="handlerReseedMission" />
    </div>
</template>

<script>
  import _ from 'lodash'
  import ReseedMission from '../plugins/mission/reseed'
  import {formatLogs} from "../plugins/common";
  import Reseed from "../components/Mission/Reseed";

  export default {
    name: 'Mission',
    components: {Reseed},
    data() {
      return {
        logId: '',
        logs: [],
        showBreathIcon: true,
        formatLogs: formatLogs,
        dialogReseedVisible: false
      }
    },

    computed: {
      missionState: function () {
        return this.$store.state.Mission.currentMission
      },
    },

    mounted() {
      if (this.missionState.processing) {
        this.startAllTimer()
      } else if (this.missionState.logId) {
        this.deepUpdateLog()
      }
    },

    destroyed() {
      this.cleanAllTimer()
      this.cleanMission()
    },

    methods: {
      cleanMission() {
        this.logs = []
        this.showBreathIcon = true
      },

      // 使用clone的方式，强制更新
      // 反正客户端不用特别考虑性能问题
      deepUpdateLog() {
        this.logs = _.clone(this.$store.getters['Mission/logByLogId'](this.logId))
      },

      startBreathTimer() {
        this.breathTimerId = setInterval(() => {
            this.showBreathIcon = !this.showBreathIcon
        }, 1e3)
      },

      startMissionProcessTimer() {
        this.missionProcessTimer = setInterval(() => {
          this.deepUpdateLog()
        }, 1e3)
      },

      startAllTimer() {
        this.startBreathTimer()
        this.startMissionProcessTimer()
      },

      cleanBreathTimer() {
        clearTimeout(this.breathTimerId)
        this.breathTimerId = null
      },

      cleanMissionProcessTimer() {
        clearTimeout(this.missionProcessTimer)
        this.missionProcessTimer = null
      },

      cleanAllTimer() {
        if (this.breathTimerId) {
          this.cleanBreathTimer()
        }
        if (this.missionProcessTimer) {
          this.cleanMissionProcessTimer()
        }
      },

      cleanMissionFinish() {
        this.deepUpdateLog()
        this.cleanAllTimer()
        this.$store.commit('Mission/updateCurrentMissionState', { processing: false, logId: '' })
        this.showBreathIcon = true
      },

      handlerReseedMissionDialogOpen() {
        if (this.$store.state.IYUU.enable_sites.length === 0 || this.$store.state.IYUU.enable_clients.length === 0) {
          this.$notify.error('请至少添加一个下载器和一个站点')
          return
        }
        this.dialogReseedVisible = true
      },

      handlerReseedMission(reseedForm) {
        console.log(reseedForm)
        this.cleanMission()

        ReseedMission.start(reseedForm.sites,reseedForm.clients, reseedForm.options, (logId) => {
          this.logId = logId
          this.startAllTimer()
        }).catch((e) => {
          this.$notify.error(`任务失败： ${e}`)
        }).finally(() => {
          this.cleanMissionFinish()
        })
      },

      handlerTransferMission() {

      },
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
