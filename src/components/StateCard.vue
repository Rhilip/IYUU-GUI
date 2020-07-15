<template>
    <el-card class="state-card">
        <p class="state-card-header">
            {{ title }}
        </p>
        <p class="state-card-body">
            {{ data }}
            <span v-if="prepend" class="state-card-body-prepend">
                {{ prepend }}
            </span>
        </p>
    </el-card>
</template>

<script>
  export default {
    name: "StateCard",
    props: {
      title: {
        type: String,
        required: true
      },
      data: {
        type: [String, Number],
        required: true
      },
      // eslint-disable-next-line vue/require-default-prop
      prepend: String
    }
  }
</script>

<style scoped>
    .state-card > .el-card__body {
        padding: 10px;
    }

    .state-card-body {
        font-size: xx-large;
        text-align: center;
    }

    .state-card-body-prepend {
        color: #909399;
        font-size: small;
    }

    .state-card-header {
        color: #909399;
        margin: 0;
    }
</style>