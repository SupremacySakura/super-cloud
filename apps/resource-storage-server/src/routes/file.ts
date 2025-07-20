import Router from '@koa/router'
import fs from 'fs-extra'
import path from 'path'
import { readDirRecursive } from '../utils';
import { randomUUID } from 'crypto';
import { FileItem } from '../types/file';
import koaBody from 'koa-body'
import { console } from 'inspector';
// 文件根目录
const ROOT_DIR = path.resolve(__dirname, '../files');

const router = new Router({
    prefix: '/file' // 所有 user 路由都会带上这个前缀
})
// 获取用户有权限访问的文件结构
router.get('/', async (ctx) => {
    const user = ctx.query.username as string;
    if (!user) {
        ctx.body = { message: 'Missing user parameter', code: 400 };
        return;
    }

    const allowedDirs = ['public', user]; // 可扩展添加更多权限规则

    const fileTree: FileItem[] = [];
    const protocol = ctx.protocol;
    const host = ctx.host;
    const fullHost = `${protocol}://${host}`;
    for (const dir of allowedDirs) {
        const dirPath = path.join(ROOT_DIR, dir);
        if (!(await fs.pathExists(dirPath))) {
            await fs.mkdir(dirPath, { recursive: true }); // 递归创建目录
        }
        const children = await readDirRecursive(ROOT_DIR, dir, fullHost);
        fileTree.push({
            id: randomUUID(),
            name: dir,
            type: 'folder',
            path: '/' + dir,
            children,
        });

    }

    ctx.body = { message: '文件列表获取成功', code: 200, data: fileTree };
});
// 获取文件内容
router.get('/read', async (ctx) => {
    const queryPath = ctx.query.filePath as string

    if (!queryPath) {
        ctx.body = { message: '缺少 path 参数', code: 400 }
        return
    }
    // 安全地构造绝对路径（假设根目录为 ./files）
    const safeQueryPath = queryPath.replace(/^\/+/, '');
    const filePath = path.join(ROOT_DIR, safeQueryPath);
    try {
        // 判断是否存在
        const exists = await fs.pathExists(filePath)
        if (!exists) {
            ctx.body = { message: '文件不存在', code: 404 }
            return
        }

        const stat = await fs.stat(filePath)
        if (stat.isFile()) {
            // 如果是文件，读取内容
            const content = await fs.readFile(filePath, 'utf-8')
            ctx.body = { message: '获取文件成功', code: 200, data: content }
        }
    } catch (err) {
        ctx.body = { message: `读取文件失败: ${err}`, code: 500 }
    }
})
//文件上传接口
router.post('/upload', koaBody({
    multipart: true,
    formidable: {
        uploadDir: ROOT_DIR,       // 上传文件临时保存目录
        keepExtensions: true,      // 保留文件后缀
        maxFileSize: 50 * 1024 * 1024, // 50MB限制
    }
}), async (ctx) => {
    const files = ctx.request.files?.file
    if (!files) {
        ctx.body = { message: '没有上传文件', code: 400 }
        return
    }
    const fileList = Array.isArray(files) ? files : [files]
    const savedFiles = []
    const targetPath = ctx.request.body.targetPath || '/public'
    console.log(targetPath)
    for (const file of fileList) {
        // koa-body 旧版本用 path，新版本用 filepath
        const oldPath = file.filepath
        const fileName = file.originalFilename
        // 目标路径：上传到对应用户目录或默认public，示例先放根目录
        const newFilePath = path.join(ROOT_DIR, targetPath, fileName || '')

        try {
            // 移动（重命名）文件到目标目录
            await fs.move(oldPath, newFilePath, { overwrite: true })

            savedFiles.push({
                id: randomUUID(),
                name: fileName,
                path: '/' + fileName,
                url: `${ctx.protocol}://${ctx.host}/resource/${fileName}` // 根据你的静态资源映射前缀调整
            })
        } catch (error) {
            ctx.body = { message: `文件保存失败 ${error}`, code: 500 }
            return
        }
    }

    ctx.body = { message: '上传成功', code: 200 }
})

export default router
