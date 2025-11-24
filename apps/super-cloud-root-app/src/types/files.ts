// 文件结构类型
export interface FileItem {
    id: string
    name: string
    type: 'file' | 'folder'
    path: string
    children?: FileItem[]
    url?: string
    size?: number
    modifiedTime?: string
}
export interface ImageItem {
    name: string
    url: string
    path: string
    size: number
}
