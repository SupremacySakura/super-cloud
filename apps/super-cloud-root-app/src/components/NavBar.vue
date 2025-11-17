<script setup lang="ts">
import { Fold } from '@element-plus/icons-vue'
import { computed, ref } from 'vue';
import cloudSvg from '../assets/cloud.svg';
import { rootNavBar } from '../router/route';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { storeToRefs } from 'pinia';
import { postLogout } from '../services/apis/login';
import { ElMessage } from 'element-plus';
const { userInfo, sid } = storeToRefs(useUserStore())
const { setUserInfo, setSid } = useUserStore();
const route = useRoute();
const router = useRouter();
// 侧边栏
const drawerOpen = ref(false);
// 登录状态
const isLogin = computed(() => {
    return sid.value && userInfo.value;
});
/**
 * 切换侧边栏
 */
const handleToggleDrawer = () => {
    drawerOpen.value = !drawerOpen.value;
};
/**
 * 登出
 */
const handleLogout = async () => {
    try {
        const res = await postLogout();
        if (res.data.code === 200) {
            ElMessage.success('登出成功');
        } else {

            ElMessage.error(`登出失败,强制登出: ${res.data.message}`)
        }
    } catch (err) {
        ElMessage.error(`登出失败,强制登出: ${err}`)
    } finally {
        setUserInfo(null);
        setSid('');
    }
};
</script>

<template>
    <div class="container">
        <div class="left-container">
            <section class="folder-icon">
                <el-icon :size="30" color="white" @click="handleToggleDrawer">
                    <Fold />
                </el-icon>
            </section>
            <section class="title">
                <h1>
                    {{rootNavBar.find(item => item.name === route.path.split('/')[1])?.text || 'Super Cloud'}}
                </h1>
                <cloudSvg style="fill: rgb(122, 160, 2494);width: 50px;height: 100%;"></cloudSvg>
            </section>
        </div>


        <div class="right-container">
            <section class="login" v-if="!isLogin">
                <button class="primary-button" @click="router.push('/login')">登录</button>
            </section>
            <section class="user-info" v-else>
                <img :src="userInfo?.avatar || '../../public/avatar.png'" alt="">
                <span>{{ userInfo?.username }}</span>
                <button class="primary-button" @click="handleLogout()">登出</button>
            </section>
        </div>
        <el-drawer v-model="drawerOpen" direction="ltr" :with-header="false">
            <div class="sidebar-container">
                <aside class="drawer">
                    <header class="drawer-header">
                        <h2>全部云产品</h2>
                    </header>
                    <div class="drawer-content">
                        <ul>
                            <li v-for="item of rootNavBar" :key="item.path" @click="router.push(item.path)"
                                :class="{ active: item.name === route.path.split('/')[1] }">
                                {{ item.text }}
                            </li>
                        </ul>
                    </div>
                    <footer class="drawer-footer"></footer>
                </aside>
            </div>
        </el-drawer>
    </div>
</template>

<style lang="less" scoped>
.container {
    width: 100vw;
    height: 50px;
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.04);
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
    z-index: 999;
    position: fixed;
    display: flex;
    justify-content: space-between;

    .left-container {
        display: flex;

        .folder-icon {
            width: 50px;
            height: 50px;
            background-color: rgb(122, 160, 249);
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
        }

        .title {
            height: 50px;
            line-height: 50px;
            padding: 0 20px;
            display: flex;
            gap: 10px;
        }
    }

    .right-container {
        display: flex;
        align-items: center;
        margin-right: 10px;

        .login {
            padding: 0 10px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0 10px;
            height: 100%;

            img {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                object-fit: cover;
                border: 1px solid rgba(0, 0, 0, 0.08);
            }

            span {
                font-size: 14px;
                color: #1d2129;
                max-width: 120px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    }
}

.sidebar-container {
    width: 100%;
    height: 100%;
    background-color: white;
    color: black;

    .drawer {
        .drawer-header {
            .header {
                height: 60px;


                h2 {
                    font-size: 14px;
                    font-weight: 600;
                }
            }

            padding: 10px 0px;
        }

        .drawer-content {
            ul {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;

                li {
                    width: 100%;
                    height: 32px;
                    line-height: 32px;
                    list-style: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 12px;
                    font-weight: 400;
                    padding: 0 24px;

                    &:hover {
                        background-color: rgb(247, 249, 250);
                    }
                }

                .active {
                    background-color: rgba(52, 152, 219, 0.1);
                    font-weight: 700;
                    color: rgb(0, 100, 200);
                }
            }
        }

    }

}
</style>