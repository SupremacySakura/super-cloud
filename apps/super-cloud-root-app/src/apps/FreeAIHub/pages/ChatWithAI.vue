<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElSelect, ElOption, ElSwitch, ElInput, ElUpload } from 'element-plus';
import type { Message, Model } from '../../../types/ai';
import { getModels, postMessage } from '../../../services/apis/ai';
// 消息列表
const messages = ref<Message[]>([]);

// 输入框内容
const inputContent = ref('');

// 加载状态
const isLoading = ref(false);

// 模型选择
const model = ref('');
const models = ref<Model[]>([]);

// 联网搜索开关
const webSearch = ref(false);

// 发送消息
const sendMessage = async () => {
    if (!inputContent.value.trim()) {
        ElMessage.warning('请输入消息内容');
        return;
    }

    // 添加用户消息
    const userMessage: Message = {
        id: Date.now(),
        role: 'user',
        content: inputContent.value,
        time: new Date().toISOString()
    };
    messages.value.push(userMessage);
    inputContent.value = '';

    // AI响应
    isLoading.value = true;
    try {
        const res = await postMessage(messages.value, model.value);
        // 添加AI响应
        const aiMessage: Message = {
            id: Date.now() + 1,
            role: 'system',
            content: res.data.data,
            time: new Date().toISOString()
        };
        messages.value.push(aiMessage);

        // 滚动到底部
        scrollToBottom();
    } catch (error) {
        ElMessage.error('发送消息失败，请稍后再试');
    } finally {
        isLoading.value = false;
    }
};
// 滚动到底部
const scrollToBottom = () => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
};

// 监听回车键
const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
};

// 页面加载完成后滚动到底部
onMounted(async () => {
    scrollToBottom();
    window.addEventListener('keydown', handleKeyPress);
    const res = await getModels();
    models.value = res.data.data
    model.value = models.value[0].value
});
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress);
});
</script>

<template>
    <div class="chat-container">
        <!-- 顶部工具栏 -->
        <div class="chat-header">
            <div class="header-left">
                <h2>AI 对话助手</h2>
            </div>
            <div class="header-right">
                <div class="settings-group">
                    <ElSelect v-model="model" placeholder="选择模型" size="small" class="model-select">
                        <ElOption v-for="item in models" :key="item.value" :label="item.label" :value="item.value" />
                    </ElSelect>
                    <div class="search-toggle">
                        <span>联网搜索</span>
                        <ElSwitch v-model="webSearch" size="small" />
                    </div>
                </div>
            </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-messages">
            <div v-for="message in messages" :key="message.id" :class="['message-item', message.role]">
                <div class="avatar">
                    {{ message.role === 'user' ? '👤' : '🤖' }}
                </div>
                <div class="message-content">
                    <div class="message-text">{{ message.content }}</div>
                    <div :class="['message-time',message.role]">{{ new Date(message.time).toLocaleTimeString() }}</div>
                </div>
            </div>
            <div v-if="isLoading" class="loading-indicator">
                <div class="spinner"></div>
                <span>AI正在思考...</span>
            </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
            <section class="input-section">
                <ElInput v-model="inputContent" type="textarea" placeholder="请输入消息..." :rows="3" resize="none"
                    class="message-input" />
            </section>
            <section class="button-section">
                <button @click="sendMessage" class="primary-button">
                    发送
                </button>
                <ElUpload class="upload-button" :show-file-list="false"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt" :disabled="isLoading">
                    <button class="third-button">
                        上传文件
                    </button>
                </ElUpload>
            </section>
        </div>
    </div>
</template>

<style scoped lang="less">
@primary-color: #3b82f6;
@primary-hover: #2563eb;
@bg-color: #f9fafb;
@card-bg: #ffffff;
@border-color: #e5e7eb;
@text-primary: #111827;
@text-secondary: #6b7280;
@shadow-color: rgba(0, 0, 0, 0.05);

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: @bg-color;
    overflow: hidden;

    .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        background-color: @card-bg;
        border-bottom: 1px solid @border-color;
        box-shadow: 0 1px 2px @shadow-color;
        flex-shrink: 0;

        .header-left {
            display: flex;
            align-items: center;
            gap: 10px;

            .icon {
                color: @primary-color;
                font-size: 20px;
            }

            h2 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: @text-primary;
            }
        }

        .header-right {
            .settings-group {
                display: flex;
                align-items: center;
                gap: 16px;

                .model-select {
                    width: 180px;
                }

                .search-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: @text-secondary;
                }
            }
        }
    }

    .chat-messages {
        flex: 1;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
        scroll-behavior: smooth;
        -ms-overflow-style: none;
        /* IE/Edge */
        scrollbar-width: none;
        /* Firefox */

        &::-webkit-scrollbar {
            display: none;
            /* Chrome/Safari */
        }

        .message-item {
            display: flex;
            gap: 12px;
            max-width: 85%;

            &.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }

            &.system {
                align-self: flex-start;
            }

            .avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: @card-bg;
                border: 1px solid @border-color;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .message-content {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .message-text {
                    padding: 12px 16px;
                    border-radius: 16px;
                    line-height: 1.6;
                    word-break: break-word;
                    white-space: pre-wrap;
                }

                .message-time {
                    font-size: 12px;
                    color: @text-secondary;
                    align-self: flex-end;
                    margin-top: 4px;
                    &.system {
                        align-self: flex-start;
                    }
                }
            }

            // 单独设置颜色样式
            &.user .message-text {
                background-color: @primary-color;
                color: white;
                border-top-right-radius: 4px;
            }

            &.system .message-text {
                background-color: @card-bg;
                color: @text-primary;
                border: 1px solid @border-color;
                border-top-left-radius: 4px;
            }
        }

        .loading-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
            color: @text-secondary;
            font-size: 14px;
            align-self: flex-start;
            padding: 10px 0;

            .spinner {
                width: 20px;
                height: 20px;
                border: 3px solid rgba(59, 130, 246, 0.2);
                border-top: 3px solid @primary-color;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
        }
    }

    .input-area {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        padding: 16px 20px;
        background-color: @card-bg;
        border-top: 1px solid @border-color;
        flex-shrink: 0;

        .input-section {
            width: 90%;
        }

        .button-section {
            width: 10%;
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>