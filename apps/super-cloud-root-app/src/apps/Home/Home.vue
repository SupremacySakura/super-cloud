<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { storeToRefs } from 'pinia';
import type { Activity, Announcement } from '../../types/home';

// 状态管理
const router = useRouter();
const { userInfo } = storeToRefs(useUserStore());
const isLogin = computed(() => !!userInfo.value);
// 系统概览卡片
const statCardList = ref([
    {
        label: '资源统计',
        value: '248',
        icon: ``,
    },
    {
        label: '用户使用量',
        value: '68%',
        icon: ``,
    },
    {
        label: '存储空间',
        value: '12.5GB / 20GB',
        icon: ` `,
    }
])
/**
 * 进入图片市场
 */
const showImageMarket = () => {
    // 检查图片市场路由是否存在
    router.push('/resource/imageMarket').catch(() => {
        // 如果路由不存在，显示提示
        alert('图片市场功能即将上线，敬请期待！');
    });
};
/**
 * 系统设置
 */
const showSettings = () => {
    alert('系统设置功能即将上线，敬请期待！');
};

// 快速操作卡片
const quickOperationCardList = ref([
    {
        label: '资源管理器',
        desc: '管理和浏览所有系统资源',
        icon: ` `,
        action: () => { router.push('/resource') }
    },
    {
        label: '图片市场',
        desc: '浏览和下载高质量图片资源',
        icon: ` `,
        action: showImageMarket
    },
    {
        label: '上传资源',
        desc: '快速上传文件和资源',
        icon: ` `,
        action: () => { router.push('/resource/fileManagement') }
    },
    {
        label: '系统设置',
        desc: '自定义您的使用体验',
        icon: ` `,
        action: showSettings
    }
])
// 数据状态
const recentActivities = ref<Activity[]>([]);
const announcements = ref<Announcement[]>([]);
const loadingActivities = ref(true);
const loadingAnnouncements = ref(true);
// 生命周期
onMounted(() => {
    fetchDashboardData();
    fetchActivities();
    fetchAnnouncements();
});

/**
 * 获取系统概览的数据
 */
const fetchDashboardData = async () => {
    try {
        // 这里应该是真实API调用
        // const response = await resourceStorageRequest.get('/dashboard/stats');
        // 模拟数据
    } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
    }
};

const fetchActivities = async () => {
    try {
        // 模拟API调用
        setTimeout(() => {
            recentActivities.value = [
                {
                    id: 1,
                    title: '资源上传成功',
                    description: '首页大图.png 已成功上传到资源库',
                    timestamp: Date.now() - 3600000,
                    type: 'upload'
                },
                {
                    id: 2,
                    title: '资源下载',
                    description: '用户下载了图片市场中的风景照.jpg',
                    timestamp: Date.now() - 86400000,
                    type: 'download'
                },
                {
                    id: 3,
                    title: '账户登录',
                    description: '在新设备上登录了您的账户',
                    timestamp: Date.now() - 172800000,
                    type: 'login'
                }
            ];
            loadingActivities.value = false;
        }, 1000);
    } catch (error) {
        console.error('Failed to fetch activities:', error);
        loadingActivities.value = false;
    }
};

const fetchAnnouncements = async () => {
    try {
        // 模拟API调用
        setTimeout(() => {
            announcements.value = [
                {
                    id: 1,
                    title: '系统维护通知',
                    content: '将于2025-07-25 02:00-04:00进行系统维护，期间服务可能中断，请合理安排工作。',
                    date: '2025-07-15',
                    author: '系统管理员',
                    isImportant: true
                },
                {
                    id: 2,
                    title: '新功能上线',
                    content: '图片市场新增批量下载功能，现在您可以同时下载多个图片资源。',
                    date: '2025-07-10',
                    author: '产品团队',
                    isImportant: false
                }
            ];
            loadingAnnouncements.value = false;
        }, 1200);
    } catch (error) {
        console.error('Failed to fetch announcements:', error);
        loadingAnnouncements.value = false;
    }
};

// 事件处理

const showAllActivities = () => {
    alert('查看全部活动记录');
};

const showAllAnnouncements = () => {
    alert('查看全部系统公告');
};

const showAnnouncementDetail = (id: number) => {
    alert(`查看公告 ${id} 的详细内容`);
};

// 辅助函数
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diff < 60) return `${diff}分钟前`;
    if (diff < 1440) return `${Math.floor(diff / 60)}小时前`;
    if (diff < 43200) return `${Math.floor(diff / 1440)}天前`;
    return date.toLocaleDateString();
};
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

        <!-- 系统概览卡片 -->
        <section class="system-overview">
            <h2 class="section-title">系统概览</h2>
            <div class="overview-grid">
                <div class="stat-card" :class="{ loading: !item.value }" v-for="item in statCardList" :key="item.label">
                    <div class="stat-icon resource-icon">

                    </div>
                    <div class="stat-value">{{ item.value || '--' }}</div>
                    <div class="stat-label">{{ item.label }}</div>
                </div>

            </div>
        </section>

        <!-- 功能快捷入口 -->
        <section class="quick-actions">
            <h2 class="section-title">快速操作</h2>
            <div class="actions-grid">
                <div class="action-card" @click="item.action" v-for="item in quickOperationCardList" :key="item.label">
                    <div class="action-icon">
                    </div>
                    <h3>{{ item.desc }}</h3>
                    <p>{{ item.desc }}</p>
                </div>

            </div>
        </section>

        <!-- 最近活动和公告 -->
        <div class="dashboard-grid">
            <!-- 最近活动 -->
            <section class="activity-section">
                <div class="section-header">
                    <h2 class="section-title">最近活动</h2>
                    <button class="view-all" @click="showAllActivities">查看全部</button>
                </div>
                <div class="activity-list" :class="{ loading: !recentActivities.length }">
                    <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                        <div class="activity-icon" :class="activity.type">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 8V12L15 15" stroke="white" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">{{ activity.title }}</div>
                            <div class="activity-desc">{{ activity.description }}</div>
                            <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                        </div>
                    </div>
                    <div v-if="!recentActivities.length && !loadingActivities" class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V12L15 15" stroke="#ccc" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p>暂无活动记录</p>
                    </div>
                </div>
            </section>

            <!-- 系统公告 -->
            <section class="announcement-section">
                <div class="section-header">
                    <h2 class="section-title">系统公告</h2>
                    <button class="view-all" @click="showAllAnnouncements">查看全部</button>
                </div>
                <div class="announcement-list" :class="{ loading: !announcements.length }">
                    <div v-for="announcement in announcements" :key="announcement.id" class="announcement-item"
                        :class="{ important: announcement.isImportant }">
                        <div class="announcement-header">
                            <h3 class="announcement-title">{{ announcement.title }}</h3>
                            <div class="announcement-date">{{ announcement.date }}</div>
                        </div>
                        <div class="announcement-content">{{ announcement.content }}</div>
                        <div class="announcement-footer">
                            <span class="announcement-author">发布者: {{ announcement.author }}</span>
                            <button class="read-more" @click="showAnnouncementDetail(announcement.id)">阅读更多</button>
                        </div>
                    </div>
                    <div v-if="!announcements.length && !loadingAnnouncements" class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M10.293 3.293L1.82 11.764C1.317 12.267 1.317 13.001 1.82 13.504L10.293 21.976C10.796 22.479 11.53 22.479 12.033 21.976L22.18 11.829C22.683 11.326 22.683 10.592 22.18 10.089L13.707 1.617C13.204 1.114 12.47 1.114 11.967 1.617L10.293 3.293Z"
                                stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M12 8V12" stroke="#ccc" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M12 16H12.01" stroke="#ccc" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                        <p>暂无公告信息</p>
                    </div>
                </div>
            </section>
        </div>
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

/* 系统概览 */
.system-overview {
    margin-bottom: 30px;

    .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
    }

    .stat-card {
        background-color: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.08);
        border: 1px solid #f0f0f0;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 102, 255, 0.12);
        }

        &.loading {
            .stat-value {
                opacity: 0.5;
                animation: pulse 1.5s infinite;
            }
        }

        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: white;

            &.resource-icon {
                background-color: #0066ff;
            }

            &.active-icon {
                background-color: #00b42a;
            }

            &.status-icon {
                background-color: #ff7d00;
            }

            &.user-icon {
                background-color: #722ed1;
            }
        }

        .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #1d2129;
            margin: 0 0 5px 0;
        }

        .stat-label {
            font-size: 14px;
            color: #666;
            margin: 0;
        }
    }
}

/* 快速操作 */
.quick-actions {
    margin-bottom: 30px;

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
    }

    .action-card {
        background-color: white;
        border-radius: 12px;
        padding: 25px 20px;
        box-shadow: 0 4px 12px rgba(0, 102, 255, 0.08);
        border: 1px solid #f0f0f0;
        transition: all 0.3s ease;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0, 102, 255, 0.12);
            border-color: #e6f0ff;
        }

        .action-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #f0f7ff;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 15px;
            color: #0066ff;
        }

        h3 {
            color: #1e3a8a;
            margin: 0 0 8px 0;
            font-size: 18px;
        }

        p {
            color: #666;
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
        }
    }
}

/* 活动和公告区域 */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.activity-section,
.announcement-section {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 102, 255, 0.08);
    border: 1px solid #f0f0f0;

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .view-all {
        font-size: 14px;
        color: #0066ff;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;

        &:hover {
            text-decoration: underline;
        }
    }
}

/* 活动列表 */
.activity-list {
    max-height: 380px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
}

.activity-item {
    display: flex;
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }

    .activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0;

        &.upload {
            background-color: #e6f7ff;
            color: #0066ff;
        }

        &.download {
            background-color: #f6ffed;
            color: #00b42a;
        }

        &.login {
            background-color: #fff7e8;
            color: #ff7d00;
        }
    }

    .activity-content {
        flex-grow: 1;
    }

    .activity-title {
        font-size: 14px;
        color: #1d2129;
        margin: 0 0 3px 0;
        font-weight: 500;
    }

    .activity-desc {
        font-size: 13px;
        color: #666;
        margin: 0 0 5px 0;
    }

    .activity-time {
        font-size: 12px;
        color: #999;
        margin: 0;
    }
}

/* 公告列表 */
.announcement-list {
    max-height: 380px;
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
    }
}

.announcement-item {
    padding: 15px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
        border-bottom: none;
    }

    &.important {
        border-left: 3px solid #ff4d4f;
        padding-left: 10px;
        margin-left: -10px;
    }

    .announcement-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
    }

    .announcement-title {
        font-size: 15px;
        color: #1d2129;
        margin: 0;
        font-weight: 500;
    }

    .announcement-date {
        font-size: 12px;
        color: #999;
        margin: 0;
    }

    .announcement-content {
        font-size: 13px;
        color: #666;
        margin: 0 0 10px 0;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .announcement-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .announcement-author {
        font-size: 12px;
        color: #999;
    }

    .read-more {
        font-size: 13px;
        color: #0066ff;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;

        &:hover {
            text-decoration: underline;
        }
    }
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #999;

    svg {
        margin-bottom: 15px;
        opacity: 0.5;
    }

    p {
        margin: 0;
        font-size: 14px;
    }
}

/* 上传模态框 */
.upload-container {
    padding: 10px 0;
}

.upload-area {
    border: 2px dashed #ddd;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        border-color: #0066ff;
        background-color: #f0f7ff;
    }

    &.dragging {
        border-color: #0066ff;
        background-color: #e6f0ff;
    }

    svg {
        margin-bottom: 15px;
        color: #999;
    }

    p {
        margin: 0;
        color: #666;
        font-size: 14px;
    }

    .browse-link {
        color: #0066ff;
        cursor: pointer;
        text-decoration: underline;
    }

    .file-input {
        display: none;
    }
}

.upload-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

/* 动画 */
@keyframes pulse {
    0% {
        opacity: 0.5;
    }

    50% {
        opacity: 0.8;
    }

    100% {
        opacity: 0.5;
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .welcome-section {
        height: auto;
        padding: 30px 20px;

        .welcome-content {
            padding: 0;
        }

        .welcome-bg {
            display: none;
        }
    }

    .overview-grid,
    .actions-grid,
    .dashboard-grid {
        grid-template-columns: 1fr;
    }

    .upload-options {
        grid-template-columns: auto;
    }
}

@media (max-width: 480px) {
    .super-cloud-home {
        padding: 15px 10px;
    }

    .welcome-section {
        padding: 20px 15px;

        h1 {
            font-size: 24px;
        }
    }

    .section-title {
        font-size: 16px;
    }

    .stat-card,
    .action-card {
        padding: 15px;
    }

    .activity-section,
    .announcement-section {
        padding: 15px;
    }
}
</style>
