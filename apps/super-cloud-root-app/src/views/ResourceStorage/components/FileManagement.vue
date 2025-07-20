<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Document, Folder } from '@element-plus/icons-vue';
import type { FileItem } from '../../../types/files';
import { getAllFiles, getFileContent, uploadFile } from '../../../services/apis/resourceStorage';
import { useUserStore } from '../../../stores/user';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
const { userInfo } = storeToRefs(useUserStore());
// 文件树数据（假设由父组件传入或后端加载）
const fileTree = ref<FileItem[]>([]);
// 当前选中文件内容
const content = ref('');
// 文件加载状态
const loading = ref(false);
// 用于展示详细信息
const selectedFile = ref<FileItem | null>(null);
// tree 配置
const treeProps = {
    children: 'children',
    label: 'name',
};

/**
 * 文件点击事件处理函数
 */
const onFileClick = async (node: FileItem) => {
    selectedFile.value = node;
    if (node.type === 'file') {
        loading.value = true;
        try {
            const res = await getFileContent(node.path);
            content.value = res.data.data
        } catch (e) {
            content.value = '读取文件失败';
        } finally {
            loading.value = false;
        }
    } else {
        content.value = '';
    }
};
/**
 * 文件大小格式化
 * @param size 文件大小
 */
const formatSize = (size: number | undefined): string => {
    if (typeof size !== 'number') return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}
/**
 * 文件时间格式化
 * @param time 时间
 */
const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).replace(/\//g, '-');
}
// 判断是否是图片类型（根据文件后缀）
const isImage = (name: string): boolean => {
    return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(name)
}
/**
 * 刷新文件树
 */
const refreshFileTree = async () => {
    try {
        if (userInfo.value) {
            const res = await getAllFiles(userInfo.value.username)
            if (res.data.code === 200) {
                fileTree.value = res.data.data
                ElMessage.success('获取文件列表成功')
                console.log(res.data)
            } else {
                ElMessage.error(`获取文件列表失败: ${res.data.message}`)
            }
        }
    } catch (err) {
        ElMessage.error(`获取文件列表失败: ${err}`);
    }
}
/**
 * 上传文件
 * @param options - 上传配置项
 */
const customUpload = async (options: any) => {
    const file = options.file
    const targetPath = selectedFile.value?.path || '/public'

    try {
        const res = await uploadFile(file, targetPath)
        if (res.data.code === 200) {
            console.log(res.data)
            ElMessage.success('上传成功')
            // 刷新列表
            refreshFileTree()
        } else {
            ElMessage.error(`上传失败：${res.data.message}`)
        }
    } catch (err) {
        console.error(err)
        ElMessage.error('上传出错')
    }
}
onMounted(async () => {
    refreshFileTree()
})
</script>

<template>
    <div class="file-manager">
        <!-- 左侧文件树 -->
        <el-tree class="file-tree" :data="fileTree" :props="treeProps" node-key="id" highlight-current
            @node-click="onFileClick">
            <template #default="{ data }">
                <span>
                    <el-icon>
                        <component :is="data.type === 'folder' ? Folder : Document" />
                    </el-icon>
                    <span style="margin-left: 5px">{{ data.name }}</span>
                </span>
            </template>
        </el-tree>

        <!-- 右侧内容区域 -->
        <div class="file-content">
            <div v-if="loading" class="loading">正在加载...</div>
            <!-- 判断是否为图片 -->
            <img v-else-if="selectedFile && selectedFile.type === 'file' && isImage(selectedFile.name)"
                :src="selectedFile.url" alt="图片预览" style="max-width: 100%; max-height: 100%;" />
            <pre v-else-if="content" class="content">{{ content }}</pre>
            <!-- 如果是目录，则显示上传区域 -->
            <div v-else-if="selectedFile && selectedFile.type === 'folder'" class="upload-area">
                <el-upload drag :http-request="customUpload" multiple="true"
                    :show-file-list="false" :headers="{}">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">拖拽文件到此或 <em>点击上传</em></div>
                    <div class="el-upload__tip">支持常规文件上传</div>
                </el-upload>
            </div>

            <!-- 默认提示 -->
            <div v-else class="placeholder">请选择一个文件或目录</div>
        </div>

        <!-- 最右侧文件信息栏 -->
        <div class="file-info" v-if="selectedFile">
            <h3>文件信息</h3>
            <ul>
                <li><strong>名称：</strong>{{ selectedFile.name }}</li>
                <li><strong>类型：</strong>{{ selectedFile.type }}</li>
                <li><strong>路径：</strong>{{ selectedFile.path }}</li>
                <li><strong>链接：</strong>{{ selectedFile.url }}</li>
                <li><strong>大小：</strong>{{ formatSize(selectedFile.size) || '未知' }}</li>
                <li><strong>修改时间：</strong>{{ formatTime(selectedFile.modifiedTime) || '未知' }}</li>
            </ul>
        </div>
    </div>
</template>


<style scoped lang="less">
.file-manager {
    display: flex;
    height: 100%;
}

.file-tree {
    width: 300px;
    border-right: 1px solid #e5e7eb;
    padding: 10px;
    overflow-y: auto;
    background-color: #f9fafb;
}

.file-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: #ffffff;
}

.file-info {
    width: 240px;
    padding: 20px;
    background-color: #ffffff;
    border-left: 1px solid #e5e7eb;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.03);
    font-size: 14px;
    transition: all 0.3s ease;

    h3 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
    }

    ul {
        list-style: none;
        padding: 0;

        li {
            margin-bottom: 12px;
            line-height: 1.5;
            word-wrap: break-word;
            word-break: break-all;
        }

        strong {
            color: #374151;
            display: inline-block;
            width: 70px;
            font-weight: 500;
            word-wrap: normal;
            word-break: normal;
        }
    }
}

.loading {
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
}

.placeholder {
    color: #9ca3af;
    font-style: italic;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 14px;
}

.content {
    white-space: pre-wrap;
    padding: 16px;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #111827;
}
</style>