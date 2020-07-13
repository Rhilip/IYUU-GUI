<template>
    <el-container>
        <el-header height="260">
            <img src="@/assets/iyuu.png">
        </el-header>
        <el-main>
            <el-row class="row-bg" justify="space-around" type="flex">
                <el-col :span="20">
                    <el-form ref="form"
                             :model="form"
                             :rules="form_rules">
                        <el-form-item label="爱语飞飞 Token" prop="token">
                            <el-input v-model="form.token" clearable focus maxlength="60"
                                      minlength="46" show-word-limit />
                        </el-form-item>
                        <el-form-item v-if="need_co_site" label="合作站点" prop="site">
                            <el-select v-model="form.site" placeholder="请选择">
                                <el-option v-for="item in co_site"
                                           :key="item"
                                           :label="item"
                                           :value="item" />
                            </el-select>
                        </el-form-item>
                        <el-form-item v-if="need_co_site" label="合作站点 用户id" prop="id">
                            <el-input v-model="form.id" />
                        </el-form-item>
                        <el-form-item v-if="need_co_site" label="合作站点 用户Passkey" prop="passkey">
                            <el-input v-model="raw_passkey" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="submitForm('form')">
                                进入
                            </el-button>
                            <el-button @click="resetForm('form')">
                                重置
                            </el-button>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </el-main>
        <el-footer>
            <div>
            <span>
                <el-link type="info" @click="shellOpen('https://www.iyuu.cn/')">API service By IYUU</el-link>
            </span>
                <el-divider direction="vertical" />
                <span>
                <el-link type="info" @click="shellOpen('https://blog.rhilip.info/')">GUI designed By Rhilip</el-link>
            </span>
            </div>
        </el-footer>
    </el-container>
</template>

<script>
  import crypto from 'crypto'
  import IYUU from '../plugins/iyuu'

  export default {
    name: 'Login',
    data() {
      return {
        need_co_site: false, // 是否需要展示合作站点认证
        should_read_disclaimer: true, // 是否需要在表单提交的时候，展示免责声明
        co_site: ['ourbits', 'hddolby', 'hdhome', 'pthome', 'moecat'],
        form: {
          token: ''
          // site: '',
          // id: '',
          // passkey: ''
        },
        form_rules: {
          token: [
            {required: true, message: '请输入Token', trigger: 'blur'},
            {type: 'string', min: 46, message: 'Token长度最短46位', trigger: 'blur'}
            // {type: 'regexp', pattern: /^IYUU{42,}$/, message: 'Token须以IYUU开头', trigger: 'blur'}
          ]
        },
        raw_passkey: null
      }
    },

    methods: {
      shellOpen(href) {
        require('electron').shell.openExternal(href)
      },

      _submit() {
        if (this.need_co_site) {
          this.registerToken()
        } else {
          this.checkToken()
        }
      },

      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.should_read_disclaimer) {
              this.$confirm(
                '在使用本工具前，请同样认真阅读IYUUAutoReseed的《免责声明》。全文如下：<br>' +
                '<br>' +
                '使用IYUUAutoReseed自动辅种工具本身是非常安全的，IYUU脚本辅种时不会跟PT站点的服务器产生任何交互，只是会把下载种子链接推送给下载器，由下载器去站点下载种子。理论上，任何站点、任何技术都无法检测你是否使用了IYUUAutoReseed。危险来自于包括但不限于以下几点：<br>' +
                '第一：建议不要自己手动跳校验，任何因为跳校验ban号，别怪我没提醒，出事后请不要怪到IYUU的头上；<br>' +
                '第二：官方首发资源、其他一切首发资源的种子，IYUUAutoReseed自动辅种工具也无法在出种前辅种，如果因为你个人的作弊而被ban号，跟IYUU无关；<br>' +
                '第三：您使用IYUU工具造成的一切损失，与IYUU无关。如不接受此条款，请不要使用IYUUAutoReseed，并立刻删除已经下载的源码。',
                {
                  title: '免责声明',
                  customClass: 'message-disclaimer',
                  dangerouslyUseHTMLString: true
                }
              )
                .then(() => {
                  this.should_read_disclaimer = false
                  this._submit()
                })
                .catch(() => {
                })
            } else {
              this._submit()
            }
          } else {
            this.$notify.error({
              title: '请先满足表单验证条件'
            })
          }
        })
      },

      resetForm(formName) {
        this.$refs[formName].resetFields()

        // 重置表单到不需要合作站点状态，并删除合作站点参数（如果有的话），防止表单提交错误
        this.need_co_site = false
        const keys = ['site', 'id', 'passkey']
        for (let j = 0; j < keys.length; j++) {
          delete this.form[keys[j]]
        }
      },

      redirectAfterLogin() {
        this.$router.push('Main')
      },

      showBindCoSite() {
        this.need_co_site = true
      },

      checkToken() {
        // 因为目前IYUU没有直接判定Token是否被绑定过的接口，
        // 所以首先请求 /api/sites 接口，如果返回信息存在 “用户未绑定合作站点账号”
        // 则扩展进行绑定
        IYUU.instance.get('/api/sites', {
          params: {
            sign: this.form.token
          }
        }).then(resp => {
          const data = resp.data
          if (data.msg.search('用户未绑定合作站点账号') > -1) {
            this.showBindCoSite()
          } else if (data.data.sites) {
            this.$notify.success({
              title: '登录验证成功',
              message: '后续可直接使用该token进行登录，不需要再次验证合作站点权限'
            })
            Promise.all([
              this.$store.dispatch('IYUU/updateSites', data.data.sites),
              this.$store.dispatch('IYUU/setToken', this.form.token)
            ]).then(() =>{
              this.redirectAfterLogin()
            })
          }
        })
      },

      registerToken() {
        // 要求合作站点用户密钥进行sha1操作 sha1(passkey)
        if (this.raw_passkey) {
          this.form.passkey = crypto.createHash('sha1').update(this.raw_passkey).digest('hex')
        }

        IYUU.instance.get('/user/login', {
          params: this.form
        }).then(resp => {
          const data = resp.data
          if (data.ret === 200) {
            // 成功
            // {"ret":200,"data":{"success":true,"user_id":xxx,"errmsg":"IYUU自动辅种工具：站点ourbits,用户ID:xxxx 登录成功！"},"msg":"","version":"1.7.0"}
            this.$notify.success({
              title: '登录验证成功',
              message: data.data.errmsg
            })
            this.$store.dispatch('IYUU/setToken', this.form.token).then(() => {
              this.redirectAfterLogin()
            })
          } else {
            // 对异常进行处理
            // {"ret":400,"data":{},"msg":"非法请求：缺少必要参数site","version":"1.7.0"}
            if (data.msg.search(/缺少必要参数|合作站点.+校验失败/)) {
              this.showBindCoSite()
            }
          }
        })
      }
    }
  }
</script>

<style scoped>
    .el-header, .el-footer {
        text-align: center;
    }

    .el-header {
        margin-top: 20px;
    }
</style>

<style>
    .message-disclaimer {
        width: 620px !important;
    }
</style>