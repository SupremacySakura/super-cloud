import Router from '@koa/router'
import fileRoutes from './file'
const router = new Router()

router.get('/', (ctx) => {
    ctx.body = '🚀 欢迎来到 Koa 根路径'
})

// 合并其他模块路由
router.use(fileRoutes.routes(), fileRoutes.allowedMethods())
export default router
