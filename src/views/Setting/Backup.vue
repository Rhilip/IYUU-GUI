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
                        <el-select v-model="cache_clean_key" placeholder="请选择" multiple collapse-tags>
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
</div>
</template>

<script>
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
          key: 'cleanAppStart'
        },
        {
          label: '任务运行计数',
          key: 'cleanMissionStart'
        },
        {
          label: '辅种总数计数',
          key: 'cleanTorrentReseed'
        }
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
    }
  }
}
</script>

<style scoped>

</style>
