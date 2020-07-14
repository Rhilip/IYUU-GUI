<template>
    <div>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>感谢你的关注和支持</b>
            </div>
            <div>
                本项目由相关作者在业余时间完成，如果你喜欢本项目，可以通过捐助来支持作者继续开发。
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>支持GUI开发作者 @Rhilip， 以进行本项目的后续开发维护</b>
            </div>
            <div>
                <el-row style="text-align: center" :gutter="20" type="flex" justify="space-around">
                    <el-col :span="12">
                        <el-tag class="demonstration">
                            支付宝
                        </el-tag>
                        <!--suppress NpmUsedModulesInstalled, HtmlUnknownTarget -->
                        <el-image class="donate-img" :src="require('@/assets/donate/Rhilip/alipay.jpg')" />
                    </el-col>
                    <el-col :span="12">
                        <el-tag class="demonstration">
                            微信支付
                        </el-tag>
                        <!--suppress NpmUsedModulesInstalled, HtmlUnknownTarget -->
                        <el-image class="donate-img" :src="require('@/assets/donate/Rhilip/wechat.png')" />
                    </el-col>
                </el-row>
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>支持IYUU开发作者 @ledccn， 用于服务器维护及续期，增加服务的延续性</b>
            </div>
            <div>
                <el-row style="text-align: center" :gutter="20" type="flex" justify="space-around">
                    <el-col :span="12">
                        <el-tag class="demonstration">
                            微信赞赏码
                        </el-tag>
                        <!--suppress NpmUsedModulesInstalled, HtmlUnknownTarget -->
                        <el-image class="donate-img" :src="require('@/assets/donate/ledccn/wechat.png')" />
                    </el-col>
                </el-row>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
  name: 'Donate',
  data () {
    return {
    }
  }
}
</script>

<style scoped>
    .demonstration {
        margin-bottom: 8px
    }
</style>
