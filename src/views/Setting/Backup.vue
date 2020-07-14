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
                        <el-select v-model="cache_clean_key" placeholder="请选择">
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
      cache_clean_key: null,
      cache_clean_keys: [
        {
          label: '站点缓存',
          key: 'IYUU/cleanSites'
        }
      ]
    }
  },

  methods: {
    cleanCache() {
      this.$store.dispatch(this.cache_clean_key).then(() => {
        const label = this.cache_clean_keys.find(o => o.key === this.cache_clean_key).label
        this.$notify.success(`清除 ${label} 项成功`)
      })
    }
  }
}
</script>

<style scoped>

</style>
