<template>
    <div>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>缓存清空</b>
            </div>
            <div>
                在某些情况下，你可能需要清空软件的部分配置项缓存。<br>
                例如：当IYUU添加了新站点支持时，你可以通过清除 站点缓存，来重新拉取最新的站点信息。
                <el-divider />
                <el-form :inline="true">
                    <el-form-item label="请选择配置项">
                        <el-select v-model="cache_clean_key" collapse-tags multiple placeholder="请选择">
                            <el-option
                                    v-for="item in cache_clean_keys"
                                    :key="item.key"
                                    :label="item.label"
                                    :value="item.key" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="warning"
                                   @click="cleanCache">
                            点击清理
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>备份与还原</b>
            </div>
            <div>
                <el-collapse :value="['1']">
                    <el-collapse-item name="1" title="备份/还原 IYUU GUI 参数">
                        <el-row :gutter="25">
                            <el-col :span="4">
                                <el-button type="primary"
                                           @click="handleGUIConfigFileExport">
                                    <i class="el-icon-download" />
                                    备份参数
                                </el-button>
                            </el-col>
                            <el-col :span="20">
                                备份 IYUU GUI 所存储的各类参数信息，方便恢复或转移至其他机器使用。<br>
                                注意：IYUU GUI参数备份文件与PHP版的IYUUAutoReseed互不通用。
                            </el-col>
                        </el-row>
                        <el-row style="margin-top: 8px" :gutter="25">
                            <el-col :span="4">
                                <el-upload
                                        ref="upload"
                                        :auto-upload="false"
                                        :on-change="handleGUIConfigFileImport"
                                        :show-file-list="false"
                                        action="http://localhost/">
                                    <el-button slot="trigger" type="primary">
                                        <i class="el-icon-upload2" />
                                        还原参数
                                    </el-button>
                                </el-upload>
                            </el-col>
                            <el-col :span="20">
                                从已有 IYUU GUI 参数备份文件从还原各类参数信息（站点、下载器等信息）
                            </el-col>
                        </el-row>
                    </el-collapse-item>
                    <el-collapse-item name="2" title="导入 IYUUAutoReseed 参数">
                        <el-row :gutter="25">
                            <el-col :span="4">
                                <el-upload
                                        ref="upload"
                                        :auto-upload="false"
                                        :on-change="handlePHPConfigFileImport"
                                        :show-file-list="false"
                                        action="http://localhost/">
                                    <el-button slot="trigger" type="primary">
                                        <i class="el-icon-upload2" />
                                        导入配置
                                    </el-button>
                                </el-upload>
                            </el-col>
                            <el-col :span="20">
                                如果你使用过PHP版的IYUUAutoReseed，可以传入使用的 <b>config.json</b> 或 <b>config.php</b> 文件。<br>
                                特别注意：程序会自动覆盖你已配置当前的站点信息和下载器信息，请谨慎操作。
                            </el-col>
                        </el-row>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </el-card>
    </div>
</template>

<script>
  import {ConfigFileBridge, IYUUAutoReseedBridge} from "../../plugins/backup";
export default {
  name: 'Backup',
  data() {
    return {
      cache_clean_key: [],
      cache_clean_keys: [
        {
          label: '站点缓存',
          key: 'IYUU/cleanSites'
        },
        {
          label: '所有已添加站点',
          key: 'IYUU/cleanEnableSites'
        },
        {
          label: '所有已添加下载服务器',
          key: 'IYUU/cleanEnableClients'
        },
        {
          label: '软件打开计数',
          key: 'Status/cleanAppStart'
        },
        {
          label: '任务运行计数',
          key: 'Status/cleanMissionStart'
        },
        {
          label: '辅种总数计数',
          key: 'Status/cleanTorrentReseed'
        },
        {
          label: '所有下载器 infoHash 缓存',
          key: 'Mission/cleanReseeded'
        },
      ]
    }
  },

  methods: {
    cleanCache() {
      for (let i = 0; i < this.cache_clean_key.length; i++) {
        this.$store.dispatch(this.cache_clean_key[i]).then(() => {
          const label = this.cache_clean_keys.find(o => o.key === this.cache_clean_key[i]).label
          this.$notify.success(`清除配置项 ${label} 成功`)
        })
      }
    },

    handlePHPConfigFileImport(file) {
      IYUUAutoReseedBridge.decodeFromFile(file.raw)
        .then(config => {
          this.$confirm('确定使用PHP版IYUUAutoReseed版配置覆盖当前下载器和站点配置？').then(() => {
            const status = IYUUAutoReseedBridge.importFromJSON(config)
            this.$notify.success(`已成功导入 ${status.site} 个站点以及 ${status.client} 个下载器配置，请再次检查对应面板相关信息是否正确。`)
          }).catch(() => {
            this.$notify.info('导入操作已取消。')
          })
        })
        .catch(msg => {
          this.$notify.error(msg)
        })
    },

    handleGUIConfigFileImport(file) {
      ConfigFileBridge.decodeFromFile(file.raw)
        .then(config => {
          this.$confirm('确定使用导入的配置文件覆盖当前软件运行参数？').then(() => {
            ConfigFileBridge.importFromJSON(config)
            this.$notify.success(`已成功导入配置文件，请再次检查对应面板相关信息是否正确。`)
          }).catch((e) => {
            console.log(e)
            this.$notify.info('导入操作已取消。')
          })
        })
        .catch(msg => {
          this.$notify.error(msg)
        })
    },

    async handleGUIConfigFileExport() {
      ConfigFileBridge.exportToJSON()
    }
  }
}
</script>

<style scoped>

</style>
