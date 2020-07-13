<template>
    <div v-if="persons.length > 0">
        <el-row class="thanks_persons" :gutter="5">
            <el-col :span="3" style="text-align: center">
                {{ personTypeNote }}
            </el-col>
            <el-col :span="21" style="margin-top: -4px">
                <el-tag v-for="item in persons"
                        :key="item"
                        class="thanks_person"
                        :type="tagType"
                        effect="plain">
                    <i :class="iconClass" />
                    {{ item }}
                </el-tag>
            </el-col>
        </el-row>
    </div>
</template>

<script>
  export default {
    name: "ShowPersons",
    props: {
      personTypeNote: {
        type: String,
        required: true
      },
      tagType: {
        type: String,
        required: true
      },
      iconClass: {
        type: String,
        required: true
      },
      persons: {
        type: Array,
        required: true
      }
    }
  }
</script>

<style scoped>
    .thanks_persons {
        margin-bottom: 10px;
    }
    .thanks_person{
        margin-right: 10px;
        margin-bottom: 5px;
    }
</style>