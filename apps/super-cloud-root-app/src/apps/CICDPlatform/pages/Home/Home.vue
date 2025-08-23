<script lang="ts" setup>
import { ref } from 'vue';

// 模拟数据 - 实际项目中可替换为真实数据
const features = [
  {
    title: '项目管理',
    description: '创建和管理您的CICD项目，设置构建流程和部署策略。',
    icon: '📊'
  },
  {
    title: '构建记录',
    description: '查看历史构建记录，分析构建日志，排查问题。',
    icon: '📋'
  },
  {
    title: '服务器管理',
    description: '管理部署目标服务器，配置环境变量和访问权限。',
    icon: '🖥️'
  },
  {
    title: '自动化测试',
    description: '集成自动化测试，确保代码质量和稳定性。',
    icon: '🧪'
  }
];

// 动画控制
const isVisible = ref(false);
setTimeout(() => {
  isVisible.value = true;
}, 100);
</script>

<template>
  <div class="container">
    <div class="welcome-section" :class="{ 'fade-in-down': isVisible }">
      <h1 class="title">欢迎使用 CI/CD 平台</h1>
      <p class="subtitle">自动化构建、测试和部署的一站式解决方案</p>
    </div>

    <div class="features-section" :class="{ 'fade-in-up': isVisible }">
      <div class="feature-card" v-for="(feature, index) in features" :key="index" :style="{ animationDelay: `${150 + index * 100}ms` }">
        <div class="feature-icon">{{ feature.icon }}</div>
        <h2 class="feature-title">{{ feature.title }}</h2>
        <p class="feature-description">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>

.container {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  cursor: default;
}

.welcome-section {
  text-align: center;
  padding: 20px 0;

  .title {
    font-size: 32px;
    color: #2c3e50;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .subtitle {
    font-size: 18px;
    color: #606f7b;
  }
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 24px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    font-size: 36px;
    margin-bottom: 16px;
    color: #007bff;
  }

  .feature-title {
    font-size: 20px;
    color: #2c3e50;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .feature-description {
    color: #606f7b;
    line-height: 1.6;
  }
}

/* 动画效果 */
.fade-in-down {
  opacity: 0;
  transform: translateY(-20px);
  animation: fadeInDown 0.6s ease-out forwards;
}

.fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
