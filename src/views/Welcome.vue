<template>
  <div class="welcome-container">
    <el-card class="welcome-card">
      <h2>{{ systemName }}</h2>
      <p class="description">
        这是一个强大的AI助手系统，能够帮助您更高效地完成工作。通过简单的对话方式，
        您可以与AI助手进行交互，获取所需的帮助和信息。
      </p>

      <h3>系统特点</h3>
      <el-row class="feature-list">
        <el-col :span="8" v-for="(feature, index) in features" :key="index">
          <el-card class="feature-card">
            <h4>{{ feature.title }}</h4>
            <p>{{ feature.description }}</p>
          </el-card>
        </el-col>
      </el-row>

      <h3>使用指南</h3>
      <el-steps direction="vertical" :active="1">
        <el-step title="开始对话" description="点击进入对话界面，开始与AI助手交互" />
        <el-step title="输入问题" description="在输入框中输入您的问题或需求" />
        <el-step title="获取回答" description="AI助手会快速处理您的问题并给出相应的回答" />
      </el-steps>

      <div class="button-container">
        <router-link to="/chat">
          <el-button type="primary" size="large">开始使用</el-button>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 系统名称
const systemName = ref('AI智能助手系统')

// 功能特点列表
const features = ref([
  {
    title: '智能对话',
    description: '通过自然语言与AI助手进行交互'
  },
  {
    title: '快速响应',
    description: '实时获取AI的专业解答'
  },
  {
    title: '多场景适用',
    description: '适用于多种工作和学习场景'
  }
])

// 页面加载完成后的欢迎效果
onMounted(() => {
  // 这里可以添加一些欢迎动画或者初始化效果
  console.log('Welcome page loaded')
})
</script>

<style scoped>
.welcome-container {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-card {
  padding: 20px;
}

.description {
  margin: 20px 0;
  line-height: 1.6;
}

.feature-list {
  margin: 20px 0;
}

.feature-card {
  margin: 10px;
  text-align: center;
}

.feature-card h4 {
  margin-bottom: 10px;
  color: #409EFF;
}

.button-container {
  margin-top: 30px;
  text-align: center;
}
</style>
