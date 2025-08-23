<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { getServer, uploadServer } from '../../../../services/apis/ci-cd'
import type { Server } from '../../../../types/server'
import { formatTime } from '../../../../utils'
import defaultServer from '../../../../../public/server.png'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Monitor, Tickets } from '@element-plus/icons-vue'

// 服务器列表
const servers = ref<Server[]>([])

// 控制对话框显示
const dialogVisible = ref(false)

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

// 页面加载时获取服务器
onMounted(async () => {
    try {
        const res = await getServer()
        servers.value = res.data.data ?? []
        console.log('服务器列表', servers.value)
    } catch (err) {
        console.error('获取服务器失败', err)
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
        console.log(res.data)
        servers.value.push(newServer)
        dialogVisible.value = false
        form.value = { port: 22 } // 重置表单
    })
}
const operateDialogVisible = ref(false);
const currentServer = ref<any>(null);
const activeTab = ref("edit");

const editForm = reactive({
    name: "",
    description: "",
    host: "",
});

function openDialog(server: any) {
    currentServer.value = server;
    Object.assign(editForm, server); // 填充表单
    activeTab.value = "edit";
    operateDialogVisible.value = true;
}

function saveEdit() {
    if (currentServer.value) {
        Object.assign(currentServer.value, editForm); // 更新数据
    }
    dialogVisible.value = false;
}
</script>

<template>
    <div class="server-page">
        <!-- 顶部操作栏 -->
        <div class="toolbar">
            <button class="add-btn" @click="dialogVisible = true">添加服务器</button>
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
                    <p>{{server.description}}</p>
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
        <div v-if="dialogVisible" class="dialog-overlay">
            <div class="dialog">
                <h2>添加服务器</h2>
                <form @submit.prevent="addServer">
                    <label>服务器名称：<input v-model="form.name" required /></label>
                    <label>IP/域名：<input v-model="form.host" required /></label>
                    <label>端口：<input type="number" v-model="form.port" /></label>
                    <label>用户名：<input v-model="form.username" required /></label>
                    <label>密码：<input type="password" v-model="form.password" /></label>
                    <label>私钥：<textarea v-model="form.private_key"></textarea></label>
                    <label>私钥密码：<input v-model="form.passphrase" /></label>
                    <label>描述：<textarea v-model="form.description"></textarea></label>
                    <div class="actions">
                        <button type="button" @click="dialogVisible = false">取消</button>
                        <button type="submit">确认</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- 操作对话框 -->
        <el-dialog v-model="operateDialogVisible" width="700px" :title="currentServer?.name + ' - 操作'">
            <div class="dialog-container">
                <!-- 左侧侧边栏 -->
                <el-menu 
                    class="side-menu" 
                    :default-active="activeTab" 
                    @select="activeTab = $event"
                    background-color="#f5f7fa"
                    text-color="#303133"
                    active-text-color="#409eff"
                >
                    <el-menu-item index="edit">
                        <el-icon><Edit /></el-icon>
                        <span>编辑服务器信息</span>
                    </el-menu-item>
                    <el-menu-item index="monitor">
                        <el-icon><Monitor /></el-icon>
                        <span>监控信息</span>
                    </el-menu-item>
                    <el-menu-item index="logs">
                        <el-icon><Tickets /></el-icon>
                        <span>运行日志</span>
                    </el-menu-item>
                </el-menu>

                <!-- 右侧内容 -->
                <div class="tab-content">
                    <div v-if="activeTab === 'edit'" class="tab-pane">
                        <h3>编辑服务器信息</h3>
                        <el-form :model="editForm" label-width="100px">
                            <el-form-item label="名称">
                                <el-input v-model="editForm.name" />
                            </el-form-item>
                            <el-form-item label="描述">
                                <el-input type="textarea" v-model="editForm.description" />
                            </el-form-item>
                            <el-form-item label="IPv4">
                                <el-input v-model="editForm.host" />
                            </el-form-item>
                        </el-form>
                    </div>

                    <div v-else-if="activeTab === 'monitor'" class="tab-pane">
                        <h3>监控信息</h3>
                        <p>这里展示服务器监控数据...</p>
                    </div>

                    <div v-else-if="activeTab === 'logs'" class="tab-pane">
                        <h3>运行日志</h3>
                        <p>这里展示日志内容...</p>
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

    .add-btn {
        padding: 8px 16px;
        background: #409eff;
        border: none;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
    }
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
</style>