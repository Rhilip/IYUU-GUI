<template>
    <div>
        <el-card class="main-card">
            <div>
                <el-table
                        row-key="id"
                        :data="sites"
                        style="width: 100%">
                    <el-table-column
                            label="站点名称"
                            prop="site"
                            align="center"
                            width="80" />
                    <el-table-column>
                        <template slot="header" slot-scope="/* eslint-disable */scope">
                            站点下载链接构造模板&nbsp;&nbsp;&nbsp;
                            <el-switch v-model="showFullUrl" />
                        </template>
                        <template slot-scope="scope">
                            {{ linkTpl(scope.row.link) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="Cookies"
                            prop="cookies"
                            align="center"
                            width="70">
                        <template slot-scope="scope">
                            <i :class="scope.row.cookies ? 'el-icon-circle-check' : 'el-icon-circle-close'"
                               :style="'color: ' + (scope.row.cookies ? 'green' : 'red')" />
                        </template>
                    </el-table-column>
                    <el-table-column align="right" width="150">
                        <template slot="header">
                            <el-button
                                    size="medium"
                                    type="success"
                                    @click="handleSiteAddBtn()">
                                <i class="el-icon-circle-plus" />&nbsp;&nbsp;添加新站点
                            </el-button>
                        </template>
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    @click="handleSiteEdit(scope.$index, scope.row)">
                                编辑
                            </el-button>
                            <el-button
                                    size="mini"
                                    type="danger"
                                    @click="handleSiteDelete(scope.$index, scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                    <template slot="append" v-if="$store.state.IYUU.enable_sites.length > 0">
                        <div class="site-status">
                            目前 IYUU 共支持 {{ $store.state.IYUU.sites.length }} 个站点，
                            您已经启用了 {{ $store.state.IYUU.enable_sites.length }} 个站点
                        </div>
                    </template>
                </el-table>
            </div>
        </el-card>

        <SiteAdd :is-visible="dialogSiteAddVisible" @close-site-add-dialog="dialogSiteAddVisible = false" />
        <SiteEdit :is-visible="dialogSiteEditVisible" @close-site-edit-dialog="dialogSiteEditVisible = false"  :info="toEditSite" />
</div>
</template>

<script>
import _ from "lodash"
import SiteAdd from '../../components/Setting/Site/SiteAdd'
import SiteEdit from '../../components/Setting/Site/SiteEdit'
import IYUU from '../../plugins/iyuu'

export default {
  name: 'Site',
  components: { SiteEdit, SiteAdd },
  data () {
    return {
      sites: [],
      showFullUrl: false,
      dialogSiteAddVisible: false,

      toEditSite: {},
      dialogSiteEditVisible: false
    }
  },

  mounted () {
    this.getSites().then(() => {
      this.sites = this.$store.getters['IYUU/signedSites']
    })
  },

  methods: {
    getSites () {
      return new Promise(resolve => {
        if (_.isEmpty(this.$store.state.IYUU.sites)) {
          IYUU.instance.get('/api/sites', {
            params: {
              sign: this.$store.state.IYUU.token
            }
          }).then(resp => {
            const data = resp.data
            if (data.data.sites) {
              this.$store.dispatch('IYUU/updateSites', data.data.sites).then(() => {
                resolve(data.data.sites)
              })
            } else {
              this.$notify.error('似乎存在什么错误，服务器未返回站点列表，请稍后再试或者重新登录测试')
            }
          })
        } else {
          resolve(this.$store.state.IYUU.sites)
        }
      })
    },

    linkTpl (link) {
      if (this.showFullUrl) {
        return link
      } else {
        let breakPos = link.length
        if (link.lastIndexOf('?') !== -1) {
          breakPos = link.lastIndexOf('?') + 1
        } else if (link.lastIndexOf('/') !== -1) {
          breakPos = link.lastIndexOf('/') + 1
        }

        return link.slice(0, breakPos) + '*'.repeat(link.length - breakPos)
      }
    },

    handleSiteAddBtn () {
      this.getSites().then(() => {
        this.dialogSiteAddVisible = true
      })
    },

    handleSiteEdit (index, row) {
      this.toEditSite = row
      this.dialogSiteEditVisible = true
    },

    handleSiteDelete (index, row) {
      this.$confirm(`确定删除站点 ${row.site}？`)
        .then(() => {
          this.$store.commit('IYUU/removeEnableSite', index)
          this.$notify.success('成功删除站点 ' + row.site)
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.site-status{padding: 10px}
</style>
