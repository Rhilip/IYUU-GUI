<template>
    <div>
        <el-button type="warning"
                   @click="test">
            点击测试
        </el-button>
    </div>
</template>

<script>
import factory from "../../plugins/btclient/factory";
import iyuuEndpoint from "../../plugins/iyuu";

export default {
  name: 'Other',
  methods: {
    async test() {
      const client = factory(this.$store.state.IYUU.enable_clients[0])
      const torrents = await client.getAllTorrents()
      const torrents_infohash = torrents.map((s) => s.infoHash)
      const resp = await iyuuEndpoint.apiHash(torrents_infohash)
      console.log(resp)
    }
  }
}
</script>

<style scoped>

</style>
