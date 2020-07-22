<template>
    <el-collapse :value="['reseed']">
        <el-collapse-item name="reseed" title="辅种任务">
            <el-form :label-position="'top'" :model="reseed" label-width="80px">
                <el-form-item label="标题">
                    <el-input v-model="reseed.title" />
                </el-form-item>
                <el-form-item label="内容模板">
                    <el-input v-model="reseed.descr" type="textarea" :autosize="{ minRows: 20 }" />
                    <div class="form-notice">
                        内容模板中的 {full_log} 等字符为占位符，如不需要可以自行删去。
                    </div>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmitWeChatReseedUpdate">
                        更新设置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-collapse-item>
    </el-collapse>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "WeChat",
    data() {
      return {
        reseed: {
          title: '',
          descr: ''
        }
      }
    },

    mounted() {
      this.reseed = _.clone(this.$store.state.IYUU.weChatNotify.reseed)
    },

    methods: {
      onSubmitWeChatReseedUpdate() {
        this.$store.commit('IYUU/updateWechatNotify', {
          part: 'reseed',
          title: this.reseed.title,
          descr: this.reseed.descr
        })
        this.$notify.success('更新微信通知模板成功')
      }
    }
  }
</script>

<style scoped>

</style>