<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllImages } from '../../../services/apis/resourceStorage'
import type { ImageItem } from '../../../types/files'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatSize } from '../../../utils'
const images = ref<ImageItem[]>([])
// 下载图片
const handleDownload = async (url: string, name: string) => {
    try {
        const response = await fetch(url, {
            mode: 'cors'
        })

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = blobUrl
        a.download = name || 'downloaded_image'
        document.body.appendChild(a) // 确保挂载在 body 上
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(blobUrl) // 释放内存
        ElMessage.success('下载成功')
    } catch (error) {
        console.error('下载失败:', error)
        ElMessage.error('下载失败')
    }
}
// 复制链接
const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        ElMessage.success('复制成功')
    }).catch(() => {
        ElMessage.error('复制失败，请手动复制')
    })
}
// 查看文件信息
const handleInfo = (img: typeof images.value[0]) => {
    ElMessageBox.alert(`
    <p>文件名：${img.name}</p>
    <p>路径：${img.path}</p>
    <p>链接：${img.url}</p>
    <p>大小：${formatSize(img.size)}</p>
  `, '图片信息', {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true
    })
}
onMounted(async () => {
    try {
        const res = await getAllImages()
        if (res.data.code === 200) {
            images.value = res.data.data
            ElMessage.success('获取图片列表成功')
        } else {
            ElMessage.error(`获取图片失败: ${res.data.message}`)
        }
    } catch (error) {
        ElMessage.error(`获取图片失败${error}`)
    }
})
</script>

<template>
    <div class="image-market">
        <el-card v-for="img in images" :key="img.url" class="image-card" shadow="hover">
            <el-image :src="img.url" :preview-src-list="[img.url]" fit="cover" style="width: 100%; height: 200px;"
                :preview-teleported="true" />
            <div class="image-info">
                <div class="name">{{ img.name }}</div>
                <div class="path">路径:{{ img.path }}</div>
                <div class="url">链接:{{ img.url }}</div>
                <div class="size">大小:{{ formatSize(img.size) }}</div>
            </div>
            <section>
                <button class="primary-button" @click="handleDownload(img.url, img.name)">下载</button>
                <button class="secondary-button" @click="handleCopy(img.url)">复制地址</button>
                <button class="third-button" @click="handleInfo(img)">查看文件信息</button>
            </section>
        </el-card>
    </div>
</template>

<style lang="less" scoped>
.image-market {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    padding: 24px;
    background-color: #f4f6f8; // 灰白背景

    .image-card {
        display: flex;
        flex-direction: column;
        border-radius: 12px;
        overflow: hidden;
        background-color: #ffffff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
            transform: translateY(-6px);
            box-shadow: 0 6px 16px rgba(0, 123, 255, 0.1); // 蓝色轻投影
        }

        .image-info {
            padding: 16px;
            background-color: #ffffff;
            border-top: 1px solid #e5e7eb;
            max-height: 120px; // 强行限制高度
            overflow: hidden; // 超出范围隐藏
            word-break: break-all;

            .name {
                font-weight: 600;
                color: #1e3a8a; // 深蓝
                font-size: 16px;
                margin-bottom: 8px;
                display: -webkit-box;
                -webkit-line-clamp: 1; // 限制显示1行
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .path,
            .url,
            .size {
                font-size: 12px;
                color: #4b5563; // 中灰
                margin-bottom: 4px;
                display: -webkit-box;
                -webkit-line-clamp: 1; // 限制显示2行
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        section {
            display: flex;
            justify-content: space-between;
            padding: 12px 10px; // 调整内边距
            background-color: #f9fafb;
            border-top: 1px solid #e5e7eb;
            flex-wrap: wrap; // 允许按钮换行
            gap: 8px; // 添加间距

            button {
                padding: 6px 10px; // 调整按钮内边距
                border-radius: 6px;
                font-size: 12px; // 减小字体大小
                font-weight: 500;
                transition: all 0.2s ease;
                border: none;
                cursor: pointer;
                flex: 1; // 让按钮均匀分配空间
                min-width: 80px; // 设置最小宽度
                text-align: center; // 文字居中

                &.primary-button {
                    background-color: #007bff;
                    color: #ffffff;

                    &:hover {
                        background-color: #0069d9;
                    }
                }

                &.secondary-button {
                    background-color: #f1f5f9;
                    color: #1e3a8a;

                    &:hover {
                        background-color: #e2e8f0;
                    }
                }

                &.third-button {
                    background-color: #e6f7ff;
                    color: #0050b3;

                    &:hover {
                        background-color: #bae7ff;
                    }
                }

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            }
        }
    }
}
</style>
