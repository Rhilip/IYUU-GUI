<template>
    <el-dialog
            :before-close="handleDialogBeforeClose"
            :visible.sync="visible"
            title="添加新下载服务器"
            top="8vh"
            width="60%"
            @close="handleDialogClose">
        <div>
            <el-form ref="form" :model="form" label-position="top">
                <el-form-item label="下载服务器类型" prop="type">
                    <el-select v-model="form.type"
                               default-first-option filterable
                               placeholder="请选择"
                               @change="handleClientTypeSelectChange">
                        <el-option
                                v-for="(value, name) in clients"
                                :key="name"
                                :label="name"
                                :value="name">
                            {{ name }}
                            <span style="float: right;">
                                <img :src="`/assets/client/${value.type}.ico`" alt="client-img" class="client-img">
                            </span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="name">
                    <template slot="label">
                        服务器名称
                        <el-tooltip effect="dark" placement="top-start">
                            <template slot="content">
                                取一个好听的名字，方便你以后认出它来
                            </template>
                            <i class="el-icon-info" />
                        </el-tooltip>
                    </template>
                    <el-input v-model="form.name" :disabled="disable_form" />
                </el-form-item>
                <el-form-item prop="address">
                    <template slot="label">
                        服务器地址
                        <el-tooltip effect="dark" placement="top-start">
                            <template slot="content">
                                完整的服务器地址（含端口），如：http://192.168.1.1:5000/
                            </template>
                            <i class="el-icon-info" />
                        </el-tooltip>
                    </template>
                    <el-input v-model="form.address" :disabled="disable_form" />
                </el-form-item>
                <el-form-item v-if="form.hasOwnProperty('username')" label="登录用户名" prop="username">
                    <el-input v-model="form.username" :disabled="disable_form" />
                </el-form-item>
                <el-form-item label="登录密码" prop="password">
                    <el-input v-model="form.password" show-password :disabled="disable_form" />
                </el-form-item>
                <el-form-item label="连接超时时间" prop="timeout">
                    <el-slider v-model="form.timeout"
                               :format-tooltip="formatTimeoutTooltip"
                               :marks="marks" :max="800e3" :min="5e3"
                               :step="1000" :disabled="disable_form" />
                </el-form-item>
                <el-form-item label="客户端ID（自动生成）" prop="uuid">
                    <el-input v-model="form.uuid" :disabled="true" />
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleDialogClose">取 消</el-button>
            <el-button type="primary" :disabled="disable_save_btn" @click="handleClientAddSave">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
  import factory from "../../../plugins/btclient/factory";

  export default {
    name: "ClientAdd",

    props: {
      isVisible: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        visible: false,
        disable_form: true,
        disable_save_btn: false,
        clients: {},
        form: {},
        marks: {
          5e3: '5 秒',
          60e3: {
            style: {
              color: '#1989FA'
            },
            label: this.$createElement('strong', '1 分钟')
          },
          300e3: '5 分钟',
          600e3: '10 分钟',
        }
      }
    },

    watch: {
      isVisible: function (newValue) {
        this.visible = newValue
      }
    },

    created() {
      this.clients = this.$store.getters['IYUU/supportClientType']
    },

    methods: {
      cleanFrom() {
        this.disable_form = true
        this.form = {}
      },

      handleDialogClose() {
        this.$emit('close-client-add-dialog')
      },

      handleClientTypeSelectChange(clientType) {
        this.form = this.clients[clientType]
        this.form.uuid = this.$uuid.v4()
        this.disable_form = false
      },

      async handleClientAddSave() {
        this.disable_save_btn = true
        this.$notify.info('正在进行下载服务器连接测试，请耐心等待')
        const client = factory(this.form)
        try {
          const pong = await client.ping()
          if (pong) {
            this.$store.commit('IYUU/addEnableClient', this.form)
            this.handleDialogClose()
          }
        } catch (e) {
          this.$notify.error('不能正常连接到下载服务器，请检查你的配置或增加超时时间')
        } finally {
          this.disable_save_btn = false
        }
      },

      handleDialogBeforeClose(done) {
        this.cleanFrom()
        done()
      },

      // FIXME 使用时间库来转换
      formatTimeoutTooltip(timeout) {
        const totalSecond = timeout / 1000
        const minute = parseInt(totalSecond / 60)
        const second = minute > 0 ? totalSecond % (60 * minute) : totalSecond

        let convert = []
        if (minute > 0) {
          convert.push(`${minute} 分钟`)
        }

        if (second > 0) {
          convert.push(`${second} 秒`)
        }

        return convert.join(' ')
      }
    }
  }

</script>

<style scoped>
    .client-img {
        height: 18px;
        margin-top: 9px;
    }
</style>