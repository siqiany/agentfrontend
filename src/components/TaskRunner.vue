<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- 聊天窗口 -->
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-lg px-4 py-2 rounded-2xl shadow"
          :class="
            msg.role === 'user'
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white text-gray-900 rounded-bl-none border'
          "
        >
          <p class="whitespace-pre-wrap">{{ msg.content }}</p>
        </div>
      </div>
    </div>

    <!-- 决策流程展示区 -->
    <div v-if="traceSteps.length" class="border-t bg-gray-100 p-4 max-h-60 overflow-y-auto">
      <h2 class="font-semibold mb-2">🤖 决策流程</h2>
      <ul class="space-y-2 text-sm text-gray-700">
        <li
          v-for="(step, index) in traceSteps"
          :key="index"
          class="p-2 rounded bg-white shadow-sm border"
        >
          {{ step }}
        </li>
      </ul>
    </div>

    <!-- PDF 上传 + 输入框 -->
    <div class="border-t bg-white p-4">
      <div class="flex items-center gap-2">
        <input
          type="file"
          accept="application/pdf"
          @change="handleFileUpload"
          class="hidden"
          ref="pdfInput"
        />
        <button
          @click="$refs.pdfInput.click()"
          class="px-3 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          📄 上传PDF
        </button>

        <textarea
          v-model="userInput"
          @keyup.enter="sendMessage"
          placeholder="请输入您的问题..."
          class="flex-1 resize-none p-2 border rounded-lg"
          rows="1"
        ></textarea>

        <button
          @click="sendMessage"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? '...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { runCrew } from '../api/agent'

export default {
  name: 'ChatInterface',
  data() {
    return {
      userInput: '',
      pdfFile: null,
      messages: [{ role: 'assistant', content: '您好，我是钢铁智能体助手，请问有什么任务？' }],
      traceSteps: [],
      loading: false,
      userId: `user_${Math.floor(Math.random() * 10000)}`,
    }
  },
  methods: {
    handleFileUpload(event) {
      this.pdfFile = event.target.files[0]
      this.messages.push({
        role: 'assistant',
        content: `📄 已上传PDF: ${this.pdfFile.name}`,
      })
    },
    async sendMessage() {
      if (!this.userInput.trim()) return

      // 显示用户消息
      const userMsg = this.userInput
      this.messages.push({ role: 'user', content: userMsg })
      this.userInput = ''

      this.loading = true
      try {
        console.log(this.pdfFile)
        const data = await runCrew(userMsg, this.pdfFile, this.userId)

        // 保存 CrewAI 决策过程
        if (data.trace) {
          this.traceSteps = data.trace.split('\n').filter(Boolean)
        }

        // 显示最终结果
        this.messages.push({
          role: 'assistant',
          content: data.result || JSON.stringify(data, null, 2),
        })

        // 滚动到底部
        this.$nextTick(() => {
          const el = this.$refs.chatWindow
          el.scrollTop = el.scrollHeight
        })
      } catch (err) {
        console.error(err)
        this.messages.push({
          role: 'assistant',
          content: '❌ 出错，请检查控制台日志。',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style>
/* 保证聊天窗口能滚动到底部 */
.flex-1 {
  overflow-anchor: auto;
}
</style>
