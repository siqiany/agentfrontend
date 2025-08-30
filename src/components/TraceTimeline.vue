<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">执行轨迹</h2>
    <div class="relative">
      <!-- 时间线 -->
      <div class="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300"></div>

      <div v-for="(step, index) in trace" :key="index" class="relative pl-8 mb-6">
        <!-- 时间点 -->
        <div
          class="absolute left-0 w-4 h-4 rounded-full"
          :class="step.success ? 'bg-green-500' : 'bg-red-500'"
        ></div>

        <!-- 内容 -->
        <div class="p-4 rounded-2xl shadow bg-white">
          <h3 class="font-semibold">{{ step.agent }}</h3>
          <p class="text-gray-600 text-sm mb-2">任务：{{ step.task }}</p>
          <p class="text-gray-800">结果：{{ step.result }}</p>
          <p v-if="step.error" class="text-red-600 text-sm mt-2">错误：{{ step.error }}</p>
          <p class="text-xs text-gray-400 mt-2">时间：{{ formatTime(step.timestamp) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  trace: {
    type: Array,
    required: true,
    default: () => [],
  },
})

/** 格式化时间 */
const formatTime = (ts) => {
  const d = new Date(ts)
  return d.toLocaleString()
}
</script>

<style scoped>
/* 可以根据需要调整美化 */
</style>
