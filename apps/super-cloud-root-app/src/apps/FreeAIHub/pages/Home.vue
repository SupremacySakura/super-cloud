<script setup lang="ts"></script>


<template>
  <div class="ai-chat-home">
    <!-- 主内容区 -->
    <main class="main-content">
      <div class="hero-section">
        <div class="logo-container">
          <div class="logo-icon">🤖</div>
          <h1>AI 对话助手</h1>
        </div>
        <p class="tagline">探索智能对话的无限可能，开启您的AI交互之旅</p>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>AI集合</h3>
            <p>一站式AI体验</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3>智能理解</h3>
            <p>深度理解您的意图，提供精准回应</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h3>高效助手</h3>
            <p>快速解决问题，提升您的工作效率</p>
          </div>
        </div>

        <a href="/AI/chat" class="launch-chat-button primary-button">
          开始对话
          <span class="launch-arrow">→</span>
        </a>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="app-footer">
      <p>AI 对话助手 © 2025 | 探索智能未来</p>
    </footer>
  </div>
</template>

<style scoped lang="less">
// 蓝白灰配色变量定义
@primary-color: #007bff;
@primary-hover: #0069d9;
@bg-color: #ffffff;
@card-bg: #f8fafc;
@text-primary: #1e293b;
@text-secondary: #64748b;
@border-color: #e2e8f0;
@shadow-color: rgba(0, 0, 0, 0.08);

// 主容器
.ai-chat-home {
  height: 100%;
  position: relative;
  padding: 20px;
  background-color: @bg-color;
  color: @text-primary;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;

  // 主内容区
  .main-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    .hero-section {
      max-width: 800px;
      width: 100%;
      text-align: center;
      padding: 40px 20px;

      .logo-container {
        margin-bottom: 30px;

        .logo-icon {
          font-size: 4rem;
          margin-bottom: 15px;
        }

        h1 {
          font-size: 3rem;
          color: @text-primary;
          margin: 0;
        }
      }

      .tagline {
        font-size: 1.3rem;
        color: @text-secondary;
        margin: 0 0 50px 0;
      }

      // 特性网格
      .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 60px;

        .feature-card {
          background-color: @card-bg;
          border: 1px solid @border-color;
          border-radius: 12px;
          padding: 25px 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px @shadow-color;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px @shadow-color;
            border-color: @primary-color;
          }

          .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 15px;
          }

          h3 {
            font-size: 1.2rem;
            margin: 0 0 10px 0;
            color: @text-primary;
          }

          p {
            font-size: 0.95rem;
            color: @text-secondary;
            margin: 0;
          }
        }
      }

      // 启动对话按钮
      .launch-chat-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 16px 40px;
        border-radius: 30px;
        font-size: 1.2rem;
        font-weight: bold;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;

        .launch-arrow {
          transition: transform 0.3s ease;
        }

        &:hover {
          transform: translateY(-5px) scale(1.03);

          .launch-arrow {
            transform: translateX(8px);
          }
        }
      }
    }
  }

  // 页脚
  .app-footer {
    text-align: center;
    padding: 20px;
    color: @text-secondary;
    font-size: 0.9rem;
    opacity: 0.7;
    margin-top: auto;
  }
}

// 旋转动画
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>