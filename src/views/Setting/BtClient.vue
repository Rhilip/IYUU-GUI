<template>
    <div>
        <el-card class="main-card">
            <div>
                <el-table
                        row-key="id"
                        :data="$store.getters['IYUU/signedBtClient']"
                        style="width: 100%">
                    <el-table-column
                            width="40">
                        <template slot-scope="scope">
                            <img :src="`/assets/client/${scope.row.type}.ico`" alt="client-img" class="client-img-list">
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="下载器名称"
                            prop="name"
                            width="120" />
                    <el-table-column
                            label="服务器地址"
                            prop="address" />
                    <el-table-column
                            label="用户名"
                            prop="username"
                            width="80"
                            align="center" />
                    <el-table-column
                            label="Hash缓存"
                            width="90"
                            align="center">
                        <template slot-scope="scope">
                            <span>{{ $store.getters['Mission/reseededByClientId'](scope.row.uuid).length }}</span>
                            <el-button type="text" icon="el-icon-delete" circle size="mini"
                                       @click="handleClientCacheClean(scope.$index, scope.row)" />
                        </template>
                    </el-table-column>
                    <el-table-column align="right" width="160">
                        <template slot="header">
                            <el-button
                                    size="medium"
                                    type="success"
                                    @click="handleClientAddBtn()">
                                <i class="el-icon-circle-plus" />&nbsp;&nbsp;添加新下载器
                            </el-button>
                        </template>
                        <template slot-scope="scope">
                            <el-button
                                    size="mini"
                                    @click="handleClientEdit(scope.$index, scope.row)">
                                编辑
                            </el-button>
                            <el-button
                                    size="mini"
                                    type="danger"
                                    @click="handleClientDelete(scope.$index, scope.row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                    <template slot="append">
                        <div class="client-status">
                            你总共添加了 {{ $store.getters['IYUU/signedBtClient'].length }} 个下载器
                        </div>
                    </template>
                </el-table>
            </div>
        </el-card>

        <ClientAdd :is-visible="dialogClientAddVisible" @close-client-add-dialog="dialogClientAddVisible = false" />
        <ClientEdit :is-visible="dialogClientEditVisible" :info="toEditClientInfo" @close-client-edit-dialog="dialogClientEditVisible = false" />
    </div>
</template>

<script>
import ClientAdd from "../../components/Setting/BtClient/ClientAdd";
import ClientEdit from "../../components/Setting/BtClient/ClientEdit";
export default {
  name: 'BtClient',
  components: {ClientEdit, ClientAdd},
  data() {
    return {
      dialogClientAddVisible: false,

      toEditClientInfo: {},
      dialogClientEditVisible: false
    }
  },
  methods: {
    handleClientAddBtn() {
      this.dialogClientAddVisible = true
    },

    handleClientEdit(index,row) {
      this.toEditClientInfo = row
      this.dialogClientEditVisible = true
    },

    handleClientDelete(index, row) {
      this.$confirm(`确定删除下载器 ${row.name}(${row.type})？`)
        .then(() => {
          this.$store.commit('IYUU/removeEnableClient', index)
        })
    },

    handleClientCacheClean(index,row) {
      this.$confirm(`确定清空该下载器 ${row.name}(${row.type}) 的 infoHash缓存？`)
        .then(() => {
          this.$store.commit('Mission/cleanReseededByClientId', row.uuid)
        })
    }
  }
}
</script>

<style scoped>
    .client-img-list {
        height: 25px;
        top: 5px;
        position: relative;
    }
    .client-status{padding: 10px}
</style>
