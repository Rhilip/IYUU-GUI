<template>
    <div>
        <el-card class="main-card">
            <div>
                <el-table
                        row-key="id"
                        :data="$store.getters['IYUU/signedBtClient']"
                        style="width: 100%">
                    <el-table-column
                            label="下载器名称"
                            prop="name">
                        <template slot-scope="scope">
                            <img :src="`/assets/client/${scope.row.type}.ico`" alt="client-img" class="client-img-list">
                            {{ scope.row.name }}
                        </template>
                    </el-table-column>
                    <el-table-column
                            label="用户名"
                            prop="username" />
                    <el-table-column
                            label="密码"
                            prop="password">
                        <template slot-scope="scope">
                            {{ '*'.repeat(scope.row.password.length) }}
                        </template>
                    </el-table-column>
                    <el-table-column align="right">
                        <template slot="header">
                            <el-button
                                    size="medium"
                                    type="success"
                                    @click="handleClientAddBtn()">
                                <i class="el-icon-circle-plus" />&nbsp;&nbsp;添加新客户端
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
    </div>
</template>

<script>
import ClientAdd from "../../components/Setting/BtClient/ClientAdd";
export default {
  name: 'BtClient',
  components: {ClientAdd},
  data() {
    return {
      dialogClientAddVisible: false
    }
  },
  methods: {
    handleClientAddBtn() {
      this.$store.commit('IYUU/removeEnableClient',0)
      this.dialogClientAddVisible = true
    },

    handleClientEdit() {

    },

    handleClientDelete() {

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
