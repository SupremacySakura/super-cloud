<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { postSendVerificationCode, postRegister } from '../../services/apis/login';
import { ElMessage } from 'element-plus'
const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const verificationCode = ref(''); // 验证码
const codeButtonText = ref('获取验证码');
const isCodeButtonDisabled = ref(false);
const countdown = ref(60);
const agreeTerms = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

// 密码强度检查
const passwordStrength = computed(() => {
    if (password.value.length < 6) return '弱';
    if (password.value.length < 10) return '中';
    return '强';
});

const passwordStrengthClass = computed(() => {
    switch (passwordStrength.value) {
        case '弱': return 'password-strength weak';
        case '中': return 'password-strength medium';
        case '强': return 'password-strength strong';
        default: return 'password-strength';
    }
});

/**
 * 获取验证码
 */
const getVerificationCode = async() => {
    if (!email.value) {
        errorMessage.value = '请先输入电子邮箱';
        return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        errorMessage.value = '请输入有效的电子邮箱';
        return;
    }

    // 发送验证码

    errorMessage.value = '';
    isCodeButtonDisabled.value = true;
    codeButtonText.value = `重新发送(${countdown.value})`;

    const timer = setInterval(() => {
        countdown.value--;
        codeButtonText.value = `重新发送(${countdown.value})`;

        if (countdown.value <= 0) {
            clearInterval(timer);
            isCodeButtonDisabled.value = false;
            codeButtonText.value = '获取验证码';
            countdown.value = 60;
        }
    }, 1000);

    // 调用发送验证码的API
    try{
        const res = await postSendVerificationCode(email.value)
        console.log(res)
        if (+res.data.code === 200){
            ElMessage.success('验证码发送成功');
        }else{
            ElMessage.error(res.data.message);
        }
    }catch(err){
        ElMessage.error(`验证码发送失败: ${err}`);
    }
   
};
/**
 * 注册
 */
const handleRegister =async () => {
    // 表单验证
    if (!username.value || !email.value || !password.value || !confirmPassword.value || !verificationCode.value) {
        errorMessage.value = '所有字段都是必填项';
        successMessage.value = '';
        return;
    }

    if (password.value !== confirmPassword.value) {
        errorMessage.value = '两次输入的密码不一致';
        successMessage.value = '';
        return;
    }

    if (!agreeTerms.value) {
        errorMessage.value = '请同意服务条款和隐私政策';
        successMessage.value = '';
        return;
    }

    // 这里添加实际注册逻辑
    try{
        const res = await postRegister(username.value, password.value, email.value, verificationCode.value)
        if (+res.data.code === 200){
            ElMessage.success('注册成功！');
            successMessage.value = '注册成功！即将跳转到登录页面...';
            // 2秒后跳转到登录页面
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }else{
            ElMessage.error(res.data.message);
        }
    }catch(err){
        ElMessage.error(`注册失败: ${err}`);
    }
};
</script>

<template>
    <div class="register-container">
        <div class="register-card">
            <div class="register-header">
                <h2>创建账户</h2>
                <p>开始您的新旅程</p>
            </div>

            <form class="register-form" @submit.prevent="handleRegister">
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input id="username" v-model="username" type="text" placeholder="请输入用户名" required />
                </div>

                <div class="form-group">
                    <label for="email">电子邮箱</label>
                    <input id="email" v-model="email" type="email" placeholder="请输入电子邮箱" required />
                </div>

                <div class="form-group">
                    <label for="password">密码</label>
                    <input id="password" v-model="password" type="password" placeholder="请输入密码" required />
                    <div v-if="password" class="password-strength-container">
                        <span class="strength-label">密码强度:</span>
                        <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">确认密码</label>
                    <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="请再次输入密码"
                        required />
                </div>

                <div class="form-group">
                    <label for="verificationCode">验证码</label>
                    <div class="verification-code-container">
                        <input id="verificationCode" v-model="verificationCode" type="text" placeholder="请输入验证码"
                            required />
                        <button type="button" class="code-button" :disabled="isCodeButtonDisabled"
                            @click="getVerificationCode">
                            {{ codeButtonText }}
                        </button>
                    </div>
                </div>

                <div class="form-group agree-terms">
                    <label>
                        <input v-model="agreeTerms" type="checkbox" required />
                        我同意<a href="#">服务条款</a>和<a href="#">隐私政策</a>
                    </label>
                </div>

                <button type="submit" class="register-button">注册</button>

                <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
                <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
            </form>

            <div class="login-link">
                已有账户? <a href="/login">立即登录</a>
            </div>
        </div>
    </div>
</template>

<style scoped>
.register-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    background-color: #f5f7fa;
    padding: 20px;
}

.register-card {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    padding: 30px;
    overflow-y: auto;
}

.register-header {
    text-align: center;
    margin-bottom: 30px;
}

.register-header h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #1d2129;
}

.register-header p {
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

.verification-code-container {
    display: flex;
    gap: 10px;
}

.verification-code-container input {
    flex: 1;
}

.code-button {
    width: 120px;
    height: 44px;
    background: #f5f7fa;
    color: #1d2129;
    border: 1px solid #c9cdcf;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.code-button:disabled {
    background: #f2f3f5;
    color: #c9cdcf;
    cursor: not-allowed;
}

.code-button:not(:disabled):hover {
    background: #e8f0fe;
    border-color: #0066ff;
    color: #0066ff;
}

.password-strength-container {
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
}

.strength-label {
    margin-right: 8px;
    color: #4e5969;
}

.password-strength {
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
}

.weak {
    background-color: #ffebee;
    color: #f53f3f;
}

.medium {
    background-color: #fff8e1;
    color: #ff7d00;
}

.strong {
    background-color: #e8f5e9;
    color: #00b42a;
}

.agree-terms {
    display: flex;
    align-items: flex-start;
}

.agree-terms input {
    width: auto;
    height: auto;
    margin-top: 3px;
    margin-right: 8px;
}

.agree-terms a {
    color: #0066ff;
    text-decoration: none;
}

.register-button {
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

.register-button:hover {
    background: #0052cc;
}

.error-message {
    margin-top: 16px;
    color: #f53f3f;
    font-size: 14px;
    text-align: center;
}

.success-message {
    margin-top: 16px;
    color: #00b42a;
    font-size: 14px;
    text-align: center;
}

.login-link {
    margin-top: 24px;
    text-align: center;
    color: #4e5969;
    font-size: 14px;
}

.login-link a {
    color: #0066ff;
    text-decoration: none;
}
</style>