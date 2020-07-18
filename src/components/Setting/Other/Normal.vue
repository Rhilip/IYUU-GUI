<template>
    <el-form :label-position="'top'">
        <el-form-item label="单次请求最大 infoHash 数">
            <el-input-number v-model="form.apiPreInfoHash" :min="1" :max="8000" />
            <div class="form-notice">
                控制请求IYUU服务器时，单次提交的最多infoHash数量。推荐设置在2000左右。<br>
                该值不易过大或过小，过大会导致IYUU服务器响应超时，过小则导致软件多次请求。
            </div>
        </el-form-item>
        <el-form-item label="推送错误重试次数">
            <el-input-number v-model="form.maxRetry" :min="1" :max="10" />
            <div class="form-notice">
                由于不可控的网络问题，例如：下载器压力过大时长时间未响应，或下载种子时不能及时响应。<br>
                此时，软件将重试多次，以尽可能的满足推送要求。
            </div>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="onSubmitNormalSettingUpdate">
                更新设置
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script>
    import _ from 'lodash'
  export default {
    name: "Normal",
    data() {
      return {
        form: {
            apiPreInfoHash: 2000
        }
      }
    },

    create() {
      this.buildFormData()
    },




    methods: {
      // 从store中获取数据
      buildFormData() {
        this.form.apiPreInfoHash = _.clone(this.$store.state.IYUU.apiPreInfoHash)
        this.form.maxRetry = _.clone(this.$store.state.IYUU.maxRetry)
      },

      async onSubmitNormalSettingUpdate() {
        this.$store.commit('IYUU/updateNormalConfig', {
          apiPreInfoHash: this.form.apiPreInfoHash,
          maxRetry: this.form.maxRetry
        })
        this.$notify.success('设置更新成功')
        this.buildFormData()
      }
    }
  }
</script>

<style scoped>

</style>