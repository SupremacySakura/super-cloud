<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { storeToRefs } from 'pinia';

// 状态管理
const router = useRouter();
const { userInfo } = storeToRefs(useUserStore());
const isLogin = computed(() => !!userInfo.value);

</script>
<template>
    <div class="super-cloud-home">
        <!-- 用户欢迎区域 -->
        <section class="welcome-section">
            <div class="welcome-content">
                <h1>欢迎使用超级云平台，{{ userInfo?.username || '用户' }}</h1>
                <p class="welcome-desc">
                    {{ isLogin ? '今天也是高效工作的一天！' : '登录后即可享受完整功能体验' }}
                </p>
                <div v-if="!isLogin" class="auth-buttons">
                    <button class="primary-button" @click="router.push('/login')">立即登录</button>
                    <button class="secondary-button" @click="router.push('/register')">免费注册</button>
                </div>
            </div>
            <div class="welcome-bg"></div>
        </section>
    </div>
</template>



<style lang="less" scoped>
.super-cloud-home {
    padding: 20px 100px;
    background-color: #f8f9fb;
    color: #333;
    font-family: 'Segoe UI', sans-serif;
    width: 100%;
    min-height: calc(100vh - 50px);
}

/* 欢迎区域 */
.welcome-section {
    position: relative;
    height: 180px;
    margin-bottom: 30px;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, #0066ff 0%, #0049b7 100%);
    color: white;

    .welcome-content {
        position: relative;
        z-index: 2;
        padding: 40px 30px;
        max-width: 700px;

        h1 {
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 600;
        }

        .welcome-desc {
            font-size: 16px;
            opacity: 0.9;
            margin: 0 0 20px 0;
        }

        .auth-buttons {
            display: flex;
            gap: 12px;

            button {
                min-width: 100px;
            }
        }
    }

    .welcome-bg {
        position: absolute;
        top: 0;
        right: 0;
        width: 50%;
        height: 100%;
        z-index: 1;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background-image: url(../../assets/cloud.svg);
            background-repeat: no-repeat;
            background-position: right center;
            background-size: contain;
            opacity: 0.15;
        }
    }
}
</style>
