<template>
    <el-dialog
            :before-close="handleSiteAddBeforeClose"
            :visible.sync="isVisible"
            class="dialog-add-new-site"
            title="添加新站点"
            width="60%"
            @close="handleDialogClose">
        <div>
            <el-form ref="site_add_form" :model="site_add_form" :rules="site_add_form_rules" label-position="top">
                <el-form-item prop="site">
                    <template slot="label">
                        站点名称
                        <el-tooltip effect="dark" placement="top-start">
                            <template slot="content">
                                本处列出IYUU目前所有支持且尚未添加站点。<br>
                                <b>请特别注意：部分站点在使用前要求备案或验证。</b>
                            </template>
                            <i class="el-icon-info" />
                        </el-tooltip>
                    </template>
                    <el-select v-model="site_add_form.site" filterable placeholder="请选择"
                               @change="handleSiteAddSelectChange">
                        <el-option
                                v-for="item in $store.getters['IYUU/unsignedSites']"
                                :key="item.site"
                                :label="item.site"
                                :value="item.site" />
                    </el-select>
                </el-form-item>
                <el-form-item prop="link">
                    <template slot="label">
                        下载链接构造模板
                        <el-tooltip effect="dark" placement="top-start">
                            <template slot="content">
                                请注意：除部分站点外，本软件通过构造可以直接下载的种子链接发送给下载器。<br>
                                请在此处直接写好下载链接构造式，但请注意：软件不检测链接是否真实可用。<br>
                                其中 {} 表示种子ID信息，请勿修改，已有模板中的 {passkey} 等信息请替换成自己信息。
                            </template>
                            <i class="el-icon-info" />
                        </el-tooltip>
                    </template>
                    <el-input v-model="site_add_form.link" :disabled="disable_link" :placeholder="link_placeholder" />
                </el-form-item>
                <el-form-item label="" prop="cookies">
                    <template slot="label">
                        站点 Cookies
                        <el-tooltip effect="dark" placement="top-start">
                            <template slot="content">
                                除部分无法构造种子下载链接的站点外，使用自动辅种功能，可以不配置站点Cookies信息。
                            </template>
                            <i class="el-icon-info" />
                        </el-tooltip>
                    </template>
                    <el-input v-model="site_add_form.cookies" :autosize="{ minRows: 2}" type="textarea" />
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
                <el-button @click="handleDialogClose">取 消</el-button>
                <el-button type="primary" @click="handleSiteAddSave">确 定</el-button>
            </span>
    </el-dialog>
</template>

<script>
import _ from 'lodash'
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
        }
      }
    }
  },

  methods: {
    cleanFrom () {
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
      if (this.$store.state.IYUU.self_download_sites.includes(site)) {
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
          this.$store.commit('IYUU/addEnableSite',
            _.merge(
              this.$store.getters['IYUU/siteInfo'](this.site_add_form.site), this.site_add_form
            )
          )
          this.cleanFrom()
          this.handleDialogClose()
        }
      })
    },

    handleSiteAddBeforeClose (done) {
      this.cleanFrom()
      done()
    }
  }
}
</script>

<style scoped>

</style>
