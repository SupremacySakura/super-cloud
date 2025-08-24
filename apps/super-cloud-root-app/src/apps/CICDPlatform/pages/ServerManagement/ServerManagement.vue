<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { connectServer, getServer, updateServer, uploadServer } from '../../../../services/apis/ci-cd'
import type { Server } from '../../../../types/server'
import { formatTime } from '../../../../utils'
import defaultServer from '../../../../../public/server.png'
import { ElMessage } from 'element-plus'
import { Edit, Monitor, Tickets, Connection } from '@element-plus/icons-vue'
import Terminal from '../../../../components/Terminal.vue' // 导入终端组件

// 服务器列表
const servers = ref<Server[]>([])
const initServer = async () => {
    try {
        const res = await getServer()
        if (res.data.code === 200) {
            ElMessage.success('获取服务器列表成功')
            servers.value = res.data.data ?? []
        }
    } catch (err) {
        ElMessage.error('获取服务器列表失败')
    }
}
// 控制对话框显示
const dialogVisible = ref(false)
// 控制操作对话框显示
const operateDialogVisible = ref(false);

// 表单数据
const form = ref<Partial<Server>>({
    name: '',
    host: '',
    port: 22,
    username: '',
    password: '',
    private_key: '',
    passphrase: '',
    description: '',
})
watch(() => operateDialogVisible.value, (newValue) => {
    if (newValue === false) {
        form.value = {
            name: '',
            host: '',
            port: 22,
            username: '',
            password: '',
            private_key: '',
            passphrase: '',
            description: '',
        }
    }
})
// 添加服务器
const addServer = () => {
    if (!form.value.name || !form.value.host || !form.value.username) {
        alert('请填写必填字段')
        return
    }
    const newServer: Server = {
        name: form.value.name!,
        host: form.value.host!,
        port: form.value.port ?? 22,
        username: form.value.username!,
        password: form.value.password,
        private_key: form.value.private_key,
        passphrase: form.value.passphrase,
        description: form.value.description,
        status: 'offline',
        last_check_time: formatTime(new Date()),
        created_at: formatTime(new Date()),
        updated_at: formatTime(new Date()),
    }
    uploadServer(newServer).then((res) => {
        if (+res.data.code === 200) {
            ElMessage.success('上传成功');
            initServer()
            dialogVisible.value = false
            form.value = { port: 22 } // 重置表单
        }
    })
}


// 当前操作的服务器
const currentServer = ref<Server>();

// 操作对话框切换标签
const activeTab = ref("edit");

// 打开操作对话框
const openDialog = (server: Server) => {
    currentServer.value = server;
    form.value = server; // 填充表单
    activeTab.value = "edit";
    operateDialogVisible.value = true;
}
// 保存编辑
const saveEdit = async () => {
    if (currentServer.value) {
        const res = await updateServer({ ...currentServer.value, ...form.value })
        if (res.data.code === 200) {
            initServer()
            ElMessage.success(res.data.message)
        } else {
            ElMessage.error(res.data.message)
        }
    }
    operateDialogVisible.value = false;
    currentServer.value = undefined;
    form.value = {}
}

// 测试连接测试结果
const testResult = ref<string[]>([]);

// 测试连接
const testConnection = async (server?: Server, model: 'password' | 'privateKey' = 'password') => {
    if (!server) {
        return
    }
    const res = await connectServer(server, model)
    testResult.value.push(res.data.data)
}
// 页面加载时获取服务器
onMounted(async () => {
    initServer()
})

</script>

<template>
    <div class="server-page">
        <!-- 顶部操作栏 -->
        <div class="toolbar">
            <button class="primary-button" @click="dialogVisible = true">添加服务器</button>
        </div>

        <!-- 卡片列表 -->
        <div class="card-list">
            <div v-for="server in servers" :key="server.id" class="server-card">
                <!-- 顶部：图标 + 名称 + 状态 -->
                <div class="card-header">
                    <img :src="defaultServer" class="os-icon" alt="OS" />
                    <div class="server-info">
                        <h3>{{ server.name }}</h3>
                        <span class="status" :class="server.status">
                            {{ server.status === 'online' ? '运行中' : server.status }}
                        </span>
                    </div>
                    <button class="login-btn" @click="openDialog(server)">操作</button>
                </div>

                <!-- 配置信息 -->
                <div class="card-body">
                    <p>{{ server.description }}</p>
                    <p>IPv4: {{ server.host }}</p>
                </div>

                <!-- 更新时间 -->
                <div class="card-footer">
                    <span>{{ formatTime(server.updated_at) }}</span>
                    <!-- <a href="javascript:;" class="renew-link">编辑</a> -->
                </div>
            </div>
        </div>

        <!-- 添加服务器对话框 -->
        <el-dialog v-model="dialogVisible" title="添加服务器" width="600px" class="add-server-dialog">
            <el-form :model="form" label-width="100px" label-position="left">
                <div class="form-grid">
                    <el-form-item label="服务器名称" required>
                        <el-input v-model="form.name" placeholder="请输入服务器名称" size="large" />
                    </el-form-item>
                    <el-form-item label="IP/域名" required>
                        <el-input v-model="form.host" placeholder="请输入服务器地址" size="large" />
                    </el-form-item>
                    <el-form-item label="端口">
                        <el-input-number v-model="form.port" :min="1" :max="65535" size="large" />
                    </el-form-item>
                    <el-form-item label="用户名" required>
                        <el-input v-model="form.username" placeholder="请输入用户名" size="large" />
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password
                            size="large" />
                    </el-form-item>
                    <el-form-item label="私钥密码">
                        <el-input v-model="form.passphrase" type="password" placeholder="请输入私钥密码" show-password
                            size="large" />
                    </el-form-item>
                </div>

                <el-form-item label="私钥">
                    <el-input v-model="form.private_key" type="textarea" :rows="3" placeholder="请输入SSH私钥"
                        resize="none" />
                </el-form-item>

                <el-form-item label="描述">
                    <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入服务器描述"
                        resize="none" />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false" size="large">取消</el-button>
                    <el-button type="primary" @click="addServer" size="large">确认添加</el-button>
                </span>
            </template>
        </el-dialog>
        <!-- 操作对话框 -->
        <el-dialog v-model="operateDialogVisible" width="700px" :title="currentServer?.name + ' - 操作'">
            <div class="dialog-container">
                <!-- 左侧侧边栏 -->
                <el-menu class="side-menu" :default-active="activeTab" @select="activeTab = $event"
                    background-color="#f5f7fa" text-color="#303133" active-text-color="#409eff">
                    <el-menu-item index="edit">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        <span>编辑服务器信息</span>
                    </el-menu-item>
                    <el-menu-item index="monitor">
                        <el-icon>
                            <Monitor />
                        </el-icon>
                        <span>监控信息</span>
                    </el-menu-item>
                    <el-menu-item index="logs">
                        <el-icon>
                            <Tickets />
                        </el-icon>
                        <span>运行日志</span>
                    </el-menu-item>
                    <el-menu-item index="connect">
                        <el-icon>
                            <Connection />
                        </el-icon>
                        <span>连接</span>
                    </el-menu-item>
                </el-menu>

                <!-- 右侧内容 -->
                <div class="tab-content">
                    <div v-if="activeTab === 'edit'" class="tab-pane">
                        <h3>编辑服务器信息</h3>
                        <el-form :model="form" label-width="100px">
                            <el-form-item label="名称">
                                <el-input v-model="form.name" />
                            </el-form-item>
                            <el-form-item label="描述">
                                <el-input type="textarea" v-model="form.description" />
                            </el-form-item>
                            <el-form-item label="IPv4">
                                <el-input v-model="form.host" />
                            </el-form-item>
                            <el-form-item label="端口">
                                <el-input v-model="form.port" />
                            </el-form-item>
                            <el-form-item label="用户名">
                                <el-input v-model="form.username" />
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-else-if="activeTab === 'monitor'" class="tab-pane">
                        <h3>监控信息</h3>
                        <Terminal></Terminal>
                    </div>

                    <div v-else-if="activeTab === 'logs'" class="tab-pane">
                        <h3>运行日志</h3>
                        <Terminal></Terminal>
                    </div>
                    <div v-else-if="activeTab === 'connect'" class="tab-pane">
                        <h3>测试连接</h3>
                        <Terminal :content="testResult" title="连接测试" placeholder="点击'测试连接'按钮开始测试..." />
                        <div class="terminal-actions">
                            <el-button type="primary" @click="testConnection(currentServer)">测试连接(密码)</el-button>
                            <el-button type="primary"
                                @click="testConnection(currentServer, 'privateKey')">测试连接(秘钥)</el-button>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveEdit">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="less" scoped>
.server-page {
    padding: 20px;
}

.toolbar {
    margin-bottom: 20px;
}

.card-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.server-card {
    width: 320px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;

    .card-header {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;

        .os-icon {
            width: 32px;
            height: 32px;
            margin-right: 12px;
        }

        .server-info {
            flex: 1;

            h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .status {
                font-size: 12px;

                &.online {
                    color: #67c23a;
                }

                &.offline {
                    color: #f56c6c;
                }
            }
        }

        .login-btn {
            padding: 4px 12px;
            font-size: 12px;
            border: 1px solid #409eff;
            color: #409eff;
            border-radius: 4px;
            background: #fff;
            cursor: pointer;
        }
    }

    .card-body {
        padding: 12px 16px;
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
    }

    .card-footer {
        padding: 10px 16px;
        font-size: 12px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #909399;

        .renew-link {
            color: #409eff;
            cursor: pointer;
        }
    }
}

.dialog-container {
    display: flex;
    height: 400px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
}

.side-menu {
    width: 180px;
    border-right: 1px solid #ebeef5;

    :deep(.el-menu-item) {
        height: 50px;
        line-height: 50px;

        &.is-active {
            background-color: #ecf5ff !important;
            border-right: 3px solid #409eff;
        }

        &:hover {
            background-color: #e6f0ff;
        }

        .el-icon {
            margin-right: 8px;
            width: 16px;
            height: 16px;
        }
    }
}

.tab-content {
    flex: 1;
    padding: 20px;
    background-color: #fff;
    overflow-y: auto;
}

.tab-pane {
    h3 {
        margin-top: 0;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #ebeef5;
        color: #303133;
    }

    p {
        color: #606266;
        font-size: 14px;
    }
}


// 覆盖 Element Plus 样式
:deep(.el-dialog__body) {
    padding: 0;
}

:deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5;
}

.terminal-actions {
    width: 100%;
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

// 添加服务器对话框样式
:deep(.add-server-dialog) {
    .el-dialog {
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);

        &__header {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
            margin: 0;
            padding: 20px 24px;

            .el-dialog__title {
                color: #fff;
                font-size: 18px;
                font-weight: 600;
            }

            .el-dialog__headerbtn {
                top: 20px;

                .el-dialog__close {
                    color: #fff;

                    &:hover {
                        color: #e6f7ff;
                    }
                }
            }
        }

        &__body {
            padding: 24px;
            background: #f8fafc;
        }

        &__footer {
            padding: 16px 24px;
            background: #f5f7fa;
            border-top: 1px solid #e4e7ed;
        }
    }

    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
    }

    .el-form-item {
        margin-bottom: 16px;

        &:last-child {
            margin-bottom: 0;
        }

        .el-form-item__label {
            color: #606266;
            font-weight: 500;
        }

        .el-input,
        .el-textarea,
        .el-input-number {
            .el-input__wrapper {
                background: #fff;
                border: 1px solid #dcdfe6;
                border-radius: 6px;
                box-shadow: none;

                &:hover {
                    border-color: #c0c4cc;
                }

                &.is-focus {
                    border-color: #409eff;
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
                }
            }
        }
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;

        .el-button {
            min-width: 100px;
            border-radius: 6px;

            &.el-button--default {
                border-color: #dcdfe6;
                color: #606266;

                &:hover {
                    border-color: #409eff;
                    color: #409eff;
                    background: #ecf5ff;
                }
            }

            &.el-button--primary {
                background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
                border: none;

                &:hover {
                    background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
                    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
                }
            }
        }
    }
}
</style>
