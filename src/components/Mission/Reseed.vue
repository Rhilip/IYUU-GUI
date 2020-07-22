<template>
    <el-dialog
            :before-close="handleDialogBeforeClose"
            :visible.sync="visible"
            title="建立辅种任务"
            top="8vh"
            width="80%"
            @close="handleDialogClose">
        <div>
            <el-form :label-position="'left'" label-width="80px">
                <el-form-item label="下载器">
                    <el-checkbox v-model="formControl.clients.checkAll"
                                 :indeterminate="formControl.clients.isIndeterminate"
                                 class="checkbox-all"
                                @change="handleClientCheckAllChange">
                        全选
                    </el-checkbox>
                    <el-checkbox-group v-model="form.clients" @change="handleCheckedClientChange">
                        <el-checkbox v-for="client in all.clients" :key="client.uuid" :label="client">
                        {{ client.name }} ({{ client.type }})
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="站点">
                    <el-checkbox v-model="formControl.sites.checkAll"
                                 :indeterminate="formControl.sites.isIndeterminate"
                                 class="checkbox-all"
                                 @change="handleSiteCheckAllChange">
                        全选
                    </el-checkbox>
                    <el-checkbox-group v-model="form.sites" @change="handleCheckedSiteChange">
                        <el-checkbox v-for="site in all.sites" :key="site.uuid" :label="site">
                            {{ site.site }}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="高级设置">
                    <el-switch
                            v-model="form.options.dryRun"
                            active-color="#13ce66"
                            active-text="空运行（只输出日志，并不发送种子到客户端）"
                            @change="disableAppCloseWhenDryRun" />
                    <br>
                    <el-switch
                            v-model="form.options.closeAppAfterRun"
                            active-color="#13ce66"
                            :disabled="disableAppCloseAfterRun"
                            active-text="任务运行完成后 自动退出软件" />
                    <br>
                    <el-switch
                            v-model="form.options.weChatNotify"
                            active-color="#13ce66"
                            active-text="任务运行完成后 微信通知运行日志" />
                </el-form-item>
            </el-form>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="handleDialogClose">取 消</el-button>
            <el-button type="primary" @click="handleDialogSave">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "Reseed",
    props: {
      isVisible: {
        type: Boolean,
        default: false
      }
    },

    data() {
      const allClient = _.clone(this.$store.state.IYUU.enable_clients);
      const allSites = _.clone(this.$store.state.IYUU.enable_sites);

      return {
        visible: false,
        all: {
          clients: allClient,
          sites: allSites,
        },

        disableAppCloseAfterRun: false,

        form: {
          clients: [],
          sites: [],
          options: {
            dryRun: false,
            closeAppAfterRun: false,
            weChatNotify: true,
          }
        },

        formControl: {
          clients: {
            checkAll: true,
            isIndeterminate: false
          },
          sites: {
            checkAll: true,
            isIndeterminate: false
          },
        }
      }
    },

    watch: {
      isVisible: function (newValue) {
        this.visible = newValue
        if (newValue) {
            this.initForm()
        }
      }
    },

    methods: {
      handleCheckAllChange(val,type) {
        this.formControl[type].checkAll = val
        this.form[type] = val ? this.all[type] : [];
        this.formControl[type].isIndeterminate = false;
      },

      handleCheckedChange(value, type) {
        let checkedCount = value.length;
        this.formControl[type].checkAll = checkedCount === this.all[type].length;
        this.formControl[type].isIndeterminate = checkedCount > 0 && checkedCount < this.all[type].length;
      },

      handleClientCheckAllChange(val) {
        return this.handleCheckAllChange(val, 'clients')
      },

      handleCheckedClientChange(val) {
        return this.handleCheckedChange(val, 'clients')
      },

      handleSiteCheckAllChange(val) {
        return this.handleCheckAllChange(val, 'sites')
      },

      handleCheckedSiteChange(val) {
        return this.handleCheckedChange(val, 'sites')
      },

      initForm() {
        this.form = {
          sites: this.all.sites,
          clients: this.all.clients,
          options: {
            dryRun: false,
            closeAppAfterRun: false,
            weChatNotify: true
          }
        }
      },

      cleanForm() {
        this.form = {
          sites: [],
          clients: [],
          options: {}
        }
      },

      disableAppCloseWhenDryRun(newValue) {
        this.disableAppCloseAfterRun = newValue
        if (newValue) {
          this.form.options.closeAppAfterRun = false
        }
      },

      handleDialogBeforeClose(done) {
        this.cleanForm()
        done()
      },

      handleDialogClose() {
        this.$emit('close-mission-reseed-dialog')
      },

      handleDialogSave() {
        this.$emit('start-reseed-mission', this.form)
        this.$notify.success('成功添加辅种任务，请耐心等待程序运行')
        this.handleDialogClose()
      }
    }
  }
</script>

<style scoped>
.checkbox-all {
    position: absolute;
    left: -80px;
    top: 23px;
}
</style>