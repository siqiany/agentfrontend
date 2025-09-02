<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- 顶部导航栏 -->
    <div class="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <button class="mr-3 text-gray-500 hover:text-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                钢铁智能体
              </span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 原有内容区域 -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- 聊天窗口 -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="chatWindow">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex animate-fade-in"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-lg px-4 py-2 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-200 hover:shadow-xl"
            :class="
              msg.role === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-none'
                : 'bg-white/90 text-gray-900 rounded-bl-none border border-gray-100'
            "
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
          </div>
        </div>
      </div>

      <!-- 决策流程展示区 -->
      <div v-if="traceSteps.length" class="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div
          @click="toggleTrace"
          class="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        >
          <h2 class="font-semibold flex items-center">
            <span class="text-blue-600 mr-2">🤖</span> 决策流程
          </h2>
          <span
            class="text-gray-600 transform transition-transform duration-200"
            :class="{'rotate-180': isTraceExpanded}"
          >
            ▼
          </span>
        </div>
        <transition name="slide">
          <div v-show="isTraceExpanded" class="p-4 max-h-60 overflow-y-auto">
            <div
              v-for="(step, index) in traceSteps"
              :key="index"
              class="mb-4 transform transition-all duration-200 hover:-translate-y-1"
            >
              <div class="p-4 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-100">
                <h3 class="font-semibold text-sm text-blue-600">
                  步骤 {{ index + 1 }}：代理 "{{ step.agent }}"
                </h3>
                <p class="text-xs text-gray-600 my-1">
                  <strong>任务描述：</strong>{{ step.task }}
                </p>
                <p class="text-xs text-gray-600 my-1">
                  <strong>输入内容：</strong>{{ step.input }}
                </p>
                <p class="text-sm text-gray-800 my-1">
                  <strong>结果：</strong>{{ step.result }}
                </p>
                <p v-if="step.error" class="text-red-600 text-xs">
                  <strong>错误：</strong>{{ step.error }}
                </p>
                <p class="text-xs text-gray-400 mt-1">时间：{{ step.timestamp }}</p>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- PDF 上传 + 输入框 -->
      <div class="border-t border-gray-200 bg-white/90 backdrop-blur-sm p-4">
        <div class="flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="file"
            accept="application/pdf"
            @change="handleFileUpload"
            class="hidden"
            ref="pdfInput"
          />
          <button
            @click="$refs.pdfInput.click()"
            class="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg
                  hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <span>📄</span>
            <span>上传PDF</span>
          </button>

          <div class="flex-1 relative">
            <textarea
              v-model="userInput"
              @keyup.enter="sendMessage"
              placeholder="请输入您的问题..."
              class="w-full resize-none p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200
                      focus:border-blue-400 transition-all duration-200"
              rows="1"
            ></textarea>
          </div>

          <button
            @click="sendMessage"
            :disabled="loading"
            class="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl
                  hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-sm
                  disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '发送中...' : '发送' }}
          </button>
        </div>
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
      isTraceExpanded: true, // 添加折叠控制变量
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
          this.traceSteps = data.trace
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
    toggleTrace() {
      this.isTraceExpanded = !this.isTraceExpanded;
    },
  },
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 美化滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.8);
}
</style>
