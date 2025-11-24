import fs from 'fs-extra'
import path from 'path'
import { FileItem } from '../types/file'
import { randomUUID } from 'crypto'
import { STATIC_PREFIX } from '../config'

// 工具函数：构造文件树
async function readDirRecursive(basePath: string, relPath: string = '', fullHost: string): Promise<FileItem[]> {
    const fullPath = path.join(basePath, relPath)
    const items = await fs.readdir(fullPath)

    const results: FileItem[] = await Promise.all(
        items.map(async (name) => {
            const absolute = path.join(fullPath, name)
            const relative = path.join(relPath, name)
            const stat = await fs.stat(absolute)
            const id = randomUUID()
            const normalizedPath = '/' + relative.replace(/\\/g, '/')
            if (stat.isDirectory()) {
                const children = await readDirRecursive(basePath, relative, fullHost)
                return {
                    id,
                    name,
                    type: 'folder',
                    path: '/' + relative.replace(/\\/g, '/'),
                    children,
                }
            } else {
                return {
                    id,
                    name,
                    type: 'file',
                    path: '/' + relative.replace(/\\/g, '/'),
                    url: fullHost + STATIC_PREFIX + normalizedPath, // 直接访问的链接
                    size: stat.size,
                    modifiedTime: stat.mtime.toISOString(),
                }
            }
        })
    )

    return results
}

export {
    readDirRecursive
}