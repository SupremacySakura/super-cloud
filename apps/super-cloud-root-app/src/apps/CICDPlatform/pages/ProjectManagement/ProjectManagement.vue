<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Setting,
  Monitor,
  Connection,
  Tickets,
  Promotion
} from '@element-plus/icons-vue'
import type { DeploymentConfig, NginxConfig, Project } from '../../../../types/project'
import { getProjects, uploadProject } from '../../../../services/apis/ci-cd'


// 项目列表
const projects = ref<Project[]>([])
const loading = ref(false)

// 控制对话框显示
const projectDialogVisible = ref(false)
const currentProject = ref<Project | null>(null)
const activeTab = ref('basic')

// 表单数据
const form = ref<Partial<Project>>({
  name: '',
  description: '',
  status: 'active',
  git_repo_id: ''
})

const deploymentConfig = ref<Partial<DeploymentConfig>>({
  name: '生产环境配置',
  deployment_path: '/var/www/html',
  build_command: 'npm run build',
  start_command: 'npm start',
  stop_command: 'npm stop',
  restart_command: 'npm restart',
  build_output_dir: 'dist',
  pre_deploy_script: '',
  post_deploy_script: '',
  env_variables: {},
  auto_deploy: false,
  auto_rollback: true
})

const nginxConfig = ref<Partial<NginxConfig>>({
  name: '默认配置',
  server_name: 'example.com',
  listen_port: 80,
  root_path: '/var/www/html',
  config_content: '',
  enabled: true
})

// 部署进度
const deploymentProgress = ref(0)
const isDeploying = ref(false)
const deploymentLogs = ref<string[]>([])

// 获取项目列表
const fetchProjects = async () => {
  loading.value = true
  try {
    const res = await getProjects()
    console.log(res)
    if (res.data.code === 200) {
      projects.value = res.data.data
      ElMessage.success('获取项目列表成功')
    }
  } catch (error) {
    ElMessage.error('获取项目列表失败')
  } finally {
    loading.value = false
  }
}

// 添加项目
const addProject = () => {
  currentProject.value = null
  form.value = {
    name: '',
    description: '',
    status: 'active',
    git_repo_id: ''
  }
  projectDialogVisible.value = true
}

// 编辑项目
const editProject = (project: Project) => {
  currentProject.value = project
  form.value = { ...project }
  projectDialogVisible.value = true
}

// 删除项目
const deleteProject = async (project: Project) => {
  try {
    // 模拟删除操作
    projects.value = projects.value.filter(p => p.id !== project.id)
    ElMessage.success('删除成功')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 保存项目
const saveProject = async () => {
  if (!form.value.name) {
    ElMessage.warning('请输入项目名称')
    return
  }

  try {
    if (currentProject.value) {
      // 更新项目
      const index = projects.value.findIndex(p => p.id === currentProject.value!.id)
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...form.value,
          updated_at: new Date()
        } as Project
      }
      ElMessage.success('更新成功')
    } else {
      // 新增项目
      const newProject: Project = {
        id: Date.now().toString(),
        name: form.value.name!,
        description: form.value.description || '',
        status: form.value.status || 'active',
        git_repo_id: form.value.git_repo_id || '',
        deployment_config_id: form.value.deployment_config_id || '',
        nginx_config_id: form.value.nginx_config_id || '',
        server_id: form.value.server_id || '',
        created_by: 'current-user-id',
        created_at: new Date(),
        updated_at: new Date()
      }
      const res = await uploadProject(newProject, deploymentConfig.value, nginxConfig.value)
      if (res.data.code === 200) {
        ElMessage.success('添加成功')
        fetchProjects()
      } else {
        ElMessage.error('添加失败')
      }
    }
    projectDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 模拟部署过程
const deployProject = async (project: Project) => {
  isDeploying.value = true
  deploymentProgress.value = 0
  deploymentLogs.value = []

  const steps = [
    '开始部署...',
    '拉取代码...',
    '安装依赖...',
    '构建项目...',
    '上传文件...',
    '配置Nginx...',
    '重启服务...',
    '部署完成!'
  ]

  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    deploymentProgress.value = ((i + 1) / steps.length) * 100
    deploymentLogs.value.push(`[${new Date().toLocaleTimeString()}] ${steps[i]}`)

    if (i === steps.length - 1) {
      ElNotification.success({
        title: '部署成功',
        message: `${project.name} 部署完成`,
        duration: 3000
      })
    }
  }

  isDeploying.value = false
}

// 页面加载时获取项目
onMounted(() => {
  fetchProjects()
})
</script>

<template>
  <div class="project-management">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <button class="primary-button" @click="addProject">
        添加项目
      </button>
    </div>

    <!-- 项目卡片列表 -->
    <div class="project-grid" v-loading="loading">
      <el-card v-for="project in projects" :key="project.id" class="project-card"
        :class="{ 'inactive': project.status === 'inactive' }">
        <template #header>
          <div class="card-header">
            <h3>{{ project.name }}</h3>
            <el-tag :type="project.status === 'active' ? 'success' : 'info'" size="small">
              {{ project.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </div>
        </template>

        <div class="card-content">
          <p class="description">{{ project.description }}</p>
          <div class="meta">
            <span>创建时间: {{ project.created_at }}</span>
          </div>
        </div>

        <template #footer>
          <div class="card-actions">
            <el-button type="primary" :icon="Promotion" size="small" @click="deployProject(project)">
              部署
            </el-button>
            <el-button :icon="Edit" size="small" @click="editProject(project)">
              编辑
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="deleteProject(project)">
              删除
            </el-button>
          </div>
        </template>
      </el-card>
    </div>

    <!-- 项目配置对话框 -->
    <el-dialog v-model="projectDialogVisible" :title="currentProject ? '编辑项目' : '添加项目'" width="800px"
      class="project-dialog">
      <div class="dialog-container">
        <!-- 左侧侧边栏 -->
        <el-menu class="side-menu" :default-active="activeTab" @select="activeTab = $event">
          <el-menu-item index="basic">
            <el-icon>
              <Setting />
            </el-icon>
            <span>基本信息</span>
          </el-menu-item>
          <el-menu-item index="deployment">
            <el-icon>
              <Connection />
            </el-icon>
            <span>部署配置</span>
          </el-menu-item>
          <el-menu-item index="nginx">
            <el-icon>
              <Monitor />
            </el-icon>
            <span>Nginx配置</span>
          </el-menu-item>
          <el-menu-item index="deploy">
            <el-icon>
              <Promotion />
            </el-icon>
            <span>一键部署</span>
          </el-menu-item>
        </el-menu>

        <!-- 右侧内容 -->
        <div class="tab-content">
          <!-- 基本信息 -->
          <div v-if="activeTab === 'basic'" class="tab-pane">
            <h3>项目基本信息</h3>
            <el-form :model="form" label-width="100px">
              <el-form-item label="项目名称" required>
                <el-input v-model="form.name" placeholder="请输入项目名称" />
              </el-form-item>
              <el-form-item label="项目描述">
                <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入项目描述" />
              </el-form-item>
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio label="active">活跃</el-radio>
                  <el-radio label="inactive">停用</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="Git仓库ID">
                <el-input v-model="form.git_repo_id" placeholder="请输入Git仓库ID" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 部署配置 -->
          <div v-else-if="activeTab === 'deployment'" class="tab-pane">
            <h3>部署配置</h3>
            <el-form :model="deploymentConfig" label-width="120px">
              <el-form-item label="配置名称">
                <el-input v-model="deploymentConfig.name" />
              </el-form-item>
              <el-form-item label="部署路径">
                <el-input v-model="deploymentConfig.deployment_path" />
              </el-form-item>
              <el-form-item label="构建命令">
                <el-input v-model="deploymentConfig.build_command" />
              </el-form-item>
              <el-form-item label="启动命令">
                <el-input v-model="deploymentConfig.start_command" />
              </el-form-item>
              <el-form-item label="构建输出目录">
                <el-input v-model="deploymentConfig.build_output_dir" />
              </el-form-item>
              <el-form-item label="自动部署">
                <el-switch v-model="deploymentConfig.auto_deploy" />
              </el-form-item>
              <el-form-item label="自动回滚">
                <el-switch v-model="deploymentConfig.auto_rollback" />
              </el-form-item>
            </el-form>
          </div>

          <!-- Nginx配置 -->
          <div v-else-if="activeTab === 'nginx'" class="tab-pane">
            <h3>Nginx配置</h3>
            <el-form :model="nginxConfig" label-width="120px">
              <el-form-item label="配置名称">
                <el-input v-model="nginxConfig.name" />
              </el-form-item>
              <el-form-item label="域名">
                <el-input v-model="nginxConfig.server_name" />
              </el-form-item>
              <el-form-item label="监听端口">
                <el-input-number v-model="nginxConfig.listen_port" :min="1" :max="65535" />
              </el-form-item>
              <el-form-item label="根目录">
                <el-input v-model="nginxConfig.root_path" />
              </el-form-item>
              <el-form-item label="启用配置">
                <el-switch v-model="nginxConfig.enabled" />
              </el-form-item>
              <el-form-item label="配置内容">
                <el-input v-model="nginxConfig.config_content" type="textarea" :rows="6" placeholder="请输入Nginx配置内容" />
              </el-form-item>
            </el-form>
          </div>

          <!-- 一键部署 -->
          <div v-else-if="activeTab === 'deploy'" class="tab-pane">
            <h3>一键部署</h3>
            <div class="deploy-section">
              <el-alert title="准备部署项目" type="info" :closable="false" />

              <div class="progress-section" v-if="isDeploying">
                <el-progress :percentage="deploymentProgress"
                  :status="deploymentProgress === 100 ? 'success' : undefined" style="margin: 20px 0;" />
                <div class="deploy-logs">
                  <div v-for="(log, index) in deploymentLogs" :key="index" class="log-entry">
                    {{ log }}
                  </div>
                </div>
              </div>

              <div class="deploy-actions" v-else>
                <el-button type="primary" :icon="Promotion" size="large" @click="deployProject(currentProject!)">
                  开始部署
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject" v-if="activeTab === 'basic'">
          {{ currentProject ? '更新' : '创建' }}
        </el-button>
        <el-button type="success" @click="activeTab = 'deploy'" v-else>
          前往部署
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.project-management {
  padding: 20px;
}

.toolbar {
  margin-bottom: 24px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.project-card {
  transition: all 0.3s ease;

  &.inactive {
    opacity: 0.7;
    background-color: #f5f7fa;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      color: #303133;
      font-size: 16px;
    }
  }

  .card-content {
    .description {
      color: #606266;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .meta {
      font-size: 12px;
      color: #909399;
    }
  }

  .card-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

.dialog-container {
  display: flex;
  height: 500px;
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
}

.deploy-section {
  .progress-section {
    margin-top: 20px;
  }

  .deploy-logs {
    background: #1f1f1f;
    color: #00ff00;
    padding: 12px;
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;

    .log-entry {
      line-height: 1.5;
    }
  }

  .deploy-actions {
    text-align: center;
    margin-top: 30px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .project-grid {
    grid-template-columns: 1fr;
  }

  .dialog-container {
    flex-direction: column;
    height: auto;
  }

  .side-menu {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>