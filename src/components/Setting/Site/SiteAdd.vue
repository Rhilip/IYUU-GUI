<template>
    <el-dialog
            :before-close="handleDialogBeforeClose"
            :visible.sync="visible"

            title="添加新站点"
            width="60%"
            top="8vh"
            @close="handleDialogClose">
        <div>
            <el-form ref="site_add_form" :model="site_add_form" :rules="site_add_form_rules" label-position="top">
                <el-form-item prop="site">
                    <template slot="label">
                        站点名称
                        <el-tooltip effect="dark" placement="top-start">
                            <template slot="content">
                                本处列出IYUU目前所有支持且尚未添加站点。<br>
                            </template>
                            <i class="el-icon-info" />
                        </el-tooltip>
                    </template>
                    <el-select v-model="site_add_form.site"
                               filterable default-first-option
                               placeholder="请选择"
                               @change="handleSiteAddSelectChange">
                        <el-option
                                v-for="item in $store.getters['IYUU/unsignedSites']"
                                :key="item.site"
                                :label="item.site"
                                :value="item.site" />
                    </el-select>
                    <div class="form-notice">
                        <b>请特别注意：部分站点在使用前要求备案或验证。</b>
                    </div>
                </el-form-item>
                <el-form-item label="下载链接构造模板" prop="link">
                    <el-input v-model="site_add_form.link" :disabled="disable_link" :placeholder="link_placeholder" />
                    <div class="form-notice">
                        除部分站点外，本软件通过构造可以直接下载的种子链接发送给下载器。（<b>不检测链接是否真实</b>）<br>
                        请在此处直接写好下载链接构造式，例如：<br>
                        <code>https://pt.example.com/download.php?id={}&passkey=abcdefgh2321234323</code><br>
                        其中 {} 表示种子ID信息，请勿修改，已有模板中的 {passkey} 等信息请替换成自己信息。
                    </div>
                </el-form-item>
                <el-form-item label="站点 Cookies" prop="cookies">
                    <el-input v-model="site_add_form.cookies" :autosize="{ minRows: 2}" type="textarea" />
                    <div class="form-notice">
                        除部分无法构造种子下载链接的站点外，只使用自动辅种功能，可以不配置站点Cookies信息。<br>
                        软件同时支持 <code>{key}={value};格式</code> 以及 <code>EditCookies插件的导出格式。</code><br>
                        但请特别注意：<b>软件仅验证是否符合格式但同样不检测Cookies是否真实可用。</b>
                    </div>
                </el-form-item>
            </el-form>
            <el-alert type="info" show-icon :closable="false">
                <template>
                    关于站点的一些<b>高级设置</b>，请在添加站点后使用“编辑”功能进行控制。
                </template>
            </el-alert>
        </div>
        <span slot="footer" class="dialog-footer">
                <el-button @click="handleDialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSiteAddSave">确 定</el-button>
            </span>
    </el-dialog>
</template>

<script>
import _ from 'lodash'
import Cookies from "../../../plugins/cookies";
export default {
  name: 'SiteAdd',

  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      visible: false,
      disable_link: false,
      link_placeholder: '',

      site_add_form: {
        site: null,
        link: '',
        cookies: ''
      },
      site_add_form_rules: {
        site: { required: true, trigger: 'blur' },
        link: {
          validator: (rule, value, callback) => {
            if (value !== '') {
              const unReplaceQuote = value.match(/({[^}]+?})/ig)
              if (unReplaceQuote) {
                callback(new Error('你还有未做替换的字符串 ' + unReplaceQuote))
              } else if (value.search('{}') === -1) {
                callback(new Error('链接中没有可被替换的 {}， 请至少保留一个'))
              }
            } else if (this.site_add_form.cookies === '') {
              callback(new Error('你必须填入链接或者Cookies中的一个'))
            }
            callback()
          },
          trigger: 'blur'
        },
        cookies: {
          validator: (rule, value, callback) => {
            if (value !== '' && !Cookies.validCookies(value)) {
              callback(new Error('你填入的Cookies格式可能存在问题，请再次检查'))
            }
            callback()
          },
          trigger: 'blur'
        }
      }
    }
  },

  watch: {
    isVisible: function (newValue) {
      this.visible = newValue
    }
  },

  methods: {
    cleanFrom () {
      this.$refs.site_add_form.clearValidate();
      this.site_add_form = {
        site: null,
        link: '',
        cookies: ''
      }
    },

    handleDialogClose () {
      this.$emit('close-site-add-dialog')
    },

    handleSiteAddSelectChange (site) {
      if (this.$store.getters['IYUU/isForceDownloadSite'](site)) {
        this.disable_link = true
        this.link_placeholder = '该站点无法构造种子下载链接，请填写Cookies项'
        this.site_add_form.link = ''
      } else {
        this.disable_link = false
        this.link_placeholder = ''
        this.site_add_form.link = this.$store.getters['IYUU/siteDownloadLinkTpl'](site)
      }
    },

    handleSiteAddSave () {
      this.$refs.site_add_form.validate((valid) => {
        if (valid) {
          let site_extra = {
            download_torrent: false
          }

          if (this.$store.getters['IYUU/isForceDownloadSite'](this.site_add_form.site)) {
            site_extra.download_torrent = true
          }

          this.$store.commit('IYUU/addEnableSite',
            _.merge(
              this.$store.getters['IYUU/siteInfo'](this.site_add_form.site), // 来自IYUU的基本信息
              this.site_add_form,  // 用户添加站点时信息
              site_extra  // 额外信息
            )
          )
          this.cleanFrom()
          this.handleDialogClose()
        }
      })
    },

    handleDialogBeforeClose (done) {
      this.cleanFrom()
      done()
    }
  }
}
</script>

<style scoped>

</style>
