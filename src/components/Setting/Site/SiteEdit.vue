<template>
    <el-dialog
            :visible.sync="visible"
            class="dialog-add-new-site"
            :title="`编辑站点 - ${site_edit_form.site}`"
            width="60%"
            top="8vh"
            @close="handleDialogClose">
        <div>
            <el-form ref="site_edit_form" :model="site_edit_form" :rules="site_add_form_rules" label-position="top">
                <el-form-item label="下载链接构造模板" prop="link">
                    <el-input v-model="site_edit_form.link"
                              :disabled="disable_link"
                              :placeholder="disable_link ? '该站点不支持构造种子下载链接' : ''" />
                </el-form-item>
                <el-form-item label="站点 Cookies" prop="cookies">
                    <el-input v-model="site_edit_form.cookies" :autosize="{ minRows: 2}" type="textarea" />
                </el-form-item>
                <el-form-item label="高级设置" prop="download_torrent">
                    推送方式：<el-switch
                            v-model="site_edit_form.download_torrent"
                            active-text="直接推送链接给下载器让其下载"
                            inactive-text="先下载链接然后发送给下载器" :disabled="disable_link" />
                    <br>
                    下载频率限制（为0时不做限制）：<br>
                    <el-row type="flex" justify="space-around">
                        <el-col :span="12">
                            请求数 <el-input-number v-model="site_edit_form.rate_limit.maxRequests" :min="0" size="small" />
                        </el-col>
                        <el-col :span="12">
                            请求周期（分钟）<el-input-number v-model="site_edit_form.rate_limit.perMinute" :min="0" size="small" />
                        </el-col>
                    </el-row>
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
                <el-button @click="handleDialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSiteEditSave">确 定</el-button>
            </span>
    </el-dialog>
</template>
<script>
import _ from "lodash"
import validCookies from "../../../plugins/cookies";
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
      visible: false,

      disable_link: false,
      site_edit_form: {
        download_torrent: false,
        rate_limit: {
          maxRequests: 0,
          perMinute: 0
        }
      },
      site_add_form_rules: {
        cookies: {
          validator: (rule, value, callback) => {
            if (this.site_edit_form.download_torrent && value === '') {
              callback(new Error(`你启用了功能 先下载种子然后发送给下载器，但未填写Cookies`))
            } else if (this.disable_link && value === '') {
              callback(new Error('该站点不支持构造种子下载链接，但你又没有填入Cookies'))
            } else if (value !== '') {
              if (!validCookies(value)) {
                callback(new Error('你填入的Cookies格式可能存在问题，请再次检查'))
              } else {
                callback()
              }
            }
          },
          trigger: 'blur'
        }
      }
    }
  },

  watch: {
    isVisible: function (newValue) {
      this.visible = newValue
    },

    // 当传入的info改变时，复制一份到 site_edit_form 中，来解决后续使用Vuex的actions进行更新时
    // “使用info出现父子组件props参数修改”或“直接对Vuex的state修改”的情况导致Vue报错
    // 我们使用新的 site_edit_form 来完整替换所有信息
    info: function () {
      this.site_edit_form = _.merge({
        download_torrent: false,
        rate_limit: {
          maxRequests: 0,
          perMinute: 0
        }
      }, this.info);

      this.disable_link = this.$store.getters['IYUU/isForceDownloadSite'](this.info.site)
    }

  },

  methods: {
    handleDialogClose () {
      this.$refs.site_edit_form.clearValidate();
      this.$emit('close-site-edit-dialog')
    },

    handleSiteEditSave() {
      this.$refs.site_edit_form.validate((valid) => {
        if (valid) {
          this.$store.commit('IYUU/editEnableSite', this.site_edit_form)
          this.handleDialogClose()
        }
      })
    },
  }
}
</script>

<style scoped>

</style>
