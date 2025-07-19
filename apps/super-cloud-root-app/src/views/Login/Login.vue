<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { postLogin } from '../../services/apis/login';
const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  // 简单表单验证
  if (!username.value || !password.value) {
    errorMessage.value = '用户名和密码不能为空';
    return;
  }

  // 登录
  try {
    const res = await postLogin(username.value, password.value);
    if (+res.data.code === 200) {
      console.log(res.data)
      router.push('/');
      ElMessage.success('登录成功');
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (err) {
    ElMessage.error(`登录失败: ${err}`);
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>账户登录</h2>
        <p>欢迎回来，请登录您的账户</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input id="username" v-model="username" type="text" placeholder="请输入用户名" required />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="password" type="password" placeholder="请输入密码" required />
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="rememberMe" type="checkbox" />
            记住我
          </label>
          <a href="#" class="forgot-password">忘记密码?</a>
        </div>

        <button type="submit" class="login-button">登录</button>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </form>

      <div class="register-link">
        还没有账户? <a href="register">立即注册</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1d2129;
}

.login-header p {
  margin: 0;
  color: #4e5969;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1d2129;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1px solid #c9cdcf;
  border-radius: 6px;
  font-size: 14px;
  transition: border 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #0066ff;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember-me {
  display: flex;
  align-items: center;
  color: #4e5969;
  font-size: 14px;
}

.remember-me input {
  margin-right: 6px;
}

.forgot-password {
  color: #0066ff;
  font-size: 14px;
  text-decoration: none;
}

.login-button {
  width: 100%;
  height: 44px;
  background: #0066ff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background: #0052cc;
}

.error-message {
  margin-top: 16px;
  color: #f53f3f;
  font-size: 14px;
  text-align: center;
}

.register-link {
  margin-top: 24px;
  text-align: center;
  color: #4e5969;
  font-size: 14px;
}

.register-link a {
  color: #0066ff;
  text-decoration: none;
}
</style>
