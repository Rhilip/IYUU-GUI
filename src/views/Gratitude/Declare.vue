<template>
    <div>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>特别鸣谢</b>
                <el-link style="float: right; padding: 3px 0" @click="shellOpen(contributors)">
                    查看所有协作者 <i class="el-icon-link" />
                </el-link>
            </div>
            <div>
                    <span id="thanks_note">
                        在项目的开发和测试中，他们给予了很多帮助和支持，在此表示感谢。<br>
                        列表中未能一一列出所有给予帮助的同学，也对他们表示感谢，如有遗漏敬请谅解。<br>
                    </span>
                <div id="thanks_persons" style="margin-top: 10px">
                    <el-tag v-for="item in thanksData"
                            :key="item"
                            class="thanks_person"
                            :type="'warning'"
                            effect="plain">
                        <i class="el-icon-s-custom" />
                        {{ item }}
                    </el-tag>
                </div>
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>问题反馈</b>
                <el-link style="float: right; padding: 3px 0" @click="shellOpen(issue)">
                    查看所有反馈者 <i class="el-icon-link" />
                </el-link>
            </div>
            <div>
                受限于开发者个人水平，在实际开发过程中可能存在各种问题未被发现。<br>
                如果你在使用过程发现问题，请考虑通过以下途径进行反馈。
                <el-divider />
                <ul>
                    <li class="report_way">
                        IYUU-GUI 官方仓库（含源码、Issue、Wiki）：
                        <el-link type="primary" @click="shellOpen('https://github.com/Rhilip/IYUU-GUI')">
                            https://github.com/Rhilip/IYUU-GUI
                        </el-link>
                    </li>
                    <li class="report_way">
                        IYUUAutoReseed 源码仓库：
                        <el-link type="primary" @click="shellOpen('https://gitee.com/ledc/IYUUAutoReseed')">
                            gitee源码仓库
                        </el-link>
                        <el-divider direction="vertical" />
                        <el-link type="primary" @click="shellOpen('https://github.com/ledccn/IYUUAutoReseed')">
                            GitHub源码仓库
                        </el-link>
                    </li>
                    <li class="report_way">
                        IYUUAutoReseed 官方教程：
                        <el-link type="primary" @click="shellOpen('https://gitee.com/ledc/IYUUAutoReseed/tree/master/wiki')">
                            https://gitee.com/ledc/IYUUAutoReseed/tree/master/wiki
                        </el-link>
                    </li>
                    <li class="report_way">
                        IYUUAutoReseed 官方问答社区：
                        <el-link type="primary" @click="shellOpen('http://wenda.iyuu.cn')">
                            http://wenda.iyuu.cn
                        </el-link>
                    </li>
                    <li class="report_way">
                        【IYUU自动辅种交流】QQ群：
                        859882209 （一群，已满）
                        <el-divider direction="vertical" />
                        931954050 （二群）
                    </li>
                </ul>
            </div>
        </el-card>
        <el-card class="main-card">
            <div slot="header" class="clearfix">
                <b>项目参考和引用</b>
                <el-link style="float: right; padding: 3px 0" @click="shellOpen(dependencies)">
                    查看所有构建依赖 <i class="el-icon-link" />
                </el-link>
            </div>
            <div>
                <span id="refs_note">
                    首先感谢 @ledccn 开发的辅种软件 IYUUAutoReseed ，并提供相应 API 使得二次开发更为方便。 <br>
                    在可视化开发过程中， @ledccn 也给予本人（@Rhilip）很多帮助。
                    <el-divider />
                    此外，IYUU GUI 的诞生也是建立在这些项目基础之上，在此一并感谢所有项目的参与人员，感谢他们的付出！
                </span>
                <div id="refs_table" style="margin-top: 10px">
                    <el-table :data="refsData" stripe>
                        <el-table-column
                                label="项目名"
                                width="240">
                            <template slot-scope="scope">
                                <el-tooltip class="item" effect="dark" :content="scope.row.note" placement="right">
                                    <span style="margin-left: 10px">{{ scope.row.name }}</span>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column
                                prop="version"
                                label="版本" width="80" />
                        <el-table-column
                                label="链接">
                            <template slot-scope="scope">
                                <el-link type="primary" @click="shellOpen(scope.row.link)">
                                    {{ scope.row.link }}
                                </el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
  name: 'Declare',
  data () {
    return {
      dependencies: 'https://github.com/Rhilip/IYUU-GUI/network/dependencies',
      issue: 'https://github.com/Rhilip/IYUU-GUI/issues',
      contributors: 'https://github.com/Rhilip/IYUU-GUI/graphs/contributors',

      // 用户鸣谢
      thanksData: [
        'ledccn', 'Rhilip'
      ],

      // 项目引用
      refsData: [
        {
          name: 'IYUUAutoReseed',
          version: '1.8.6',
          note: 'IYUUAutoReseed 官方项目（基于PHP）',
          link: 'https://github.com/ledccn/IYUUAutoReseed/'
        },
        {
          name: 'Electron',
          version: '8.4.0',
          note: '使用 JavaScript，HTML 和 CSS 构建跨平台的桌面应用程序。',
          link: 'https://www.electronjs.org/'
        },
        {
          name: 'Vue CLI Plugin Electron Builder',
          version: '2.0.0',
          note: 'Easily Build Your Vue.js App For Desktop With Electron',
          link: 'https://nklayman.github.io/vue-cli-plugin-electron-builder/'
        },
        {
          name: 'Vue.js',
          version: '2.5.16',
          note: '渐进式JavaScript 框架',
          link: 'https://cn.vuejs.org/index.html'
        },
        {
          name: 'Vuex',
          version: '3.0.1',
          note: '专为 Vue.js 应用程序开发的状态管理模式',
          link: 'https://vuex.vuejs.org/zh/'
        },
        {
          name: 'Vue Router',
          version: '3.0.1',
          note: 'Vue.js 官方的路由管理器',
          link: 'https://router.vuejs.org/zh/'
        },
        {
          name: 'Element',
          version: '2.13.2',
          note: '一套为开发者、设计师和产品经理准备的基于 Vue 2.0 的桌面端组件库',
          link: 'https://element.eleme.cn/#/zh-CN'
        },
        {
          name: 'axios',
          version: '0.18.0',
          note: 'Promise based HTTP client for the browser and node.js',
          link: 'https://github.com/axios/axios'
        },
        {
          name: 'Lodash',
          version: '4.17.19',
          note: 'A modern JavaScript utility library delivering modularity, performance & extras.',
          link: 'https://lodash.com/'
        },

        // ▲▲▲▲其他项目（直接相关的）请添加到此处以上▲▲▲▲
        {
          name: '....',
          version: '....',
          note: '其他底层项目'
          // link: '....'
        }
      ]
    }
  },
  methods: {
    shellOpen (href) {
      require('electron').shell.openExternal(href)
    }
  }
}
</script>

<style scoped>
    .thanks_person{
        margin-right: 10px;
        margin-bottom: 5px;
    }
    .report_way{
        margin: 5px 0;
    }
</style>
