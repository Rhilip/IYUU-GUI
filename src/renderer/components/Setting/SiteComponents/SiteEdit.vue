<template>
    <el-dialog
            :visible.sync="isVisible"
            class="dialog-add-new-site"
            title="编辑站点"
            width="60%">
        <div>
            <el-form ref="site_edit_form" :model="site_edit_form" label-position="top">
                <el-form-item label="站点名称" prop="site">
                    <el-input v-model="site_edit_form.site" :disabled="true" />
                </el-form-item>
                <el-form-item label="下载链接构造模板" prop="link">
                    <el-input v-model="site_edit_form.link" />
                </el-form-item>
                <el-form-item label="站点 Cookies" prop="cookies">
                    <el-input v-model="site_edit_form.cookies" :autosize="{ minRows: 2}" type="textarea" />
                </el-form-item>
                <!-- TODO 高级选项 -->
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
                <el-button @click="handleDialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSiteEditSave">确 定</el-button>
            </span>
    </el-dialog>
</template>
<script>
export default {
  name: 'SiteEdit',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },

    info: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      site_edit_form: {}
    }
  },

  watch: {
    // 当传入的info改变时，复制一份到site_edit_form中，来因为后续使用Vuex的actions进行更新时
    // “使用info出现父子组件props参数修改”或“直接对Vuex的state修改”的情况导致Vue报错
    info: function () {
      this.site_edit_form = this.$lodash.cloneDeep(this.info)
    }
  },

  methods: {
    handleDialogClose () {
      this.$emit('close-site-edit-dialog')
    },

    handleSiteEditSave () {
      this.$store.dispatch('IYUU/editEnableSite', this.site_edit_form).then(() => {
        this.$notify.success(`更新站点 ${this.info.site} 信息成功`)
        this.handleDialogClose()
      })
    },

    handleSiteEditBeforeClose () {}
  }
}
</script>

<style scoped>

</style>
