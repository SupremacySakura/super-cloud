import Router from '@koa/router'
import fileRoutes from './file'
import aiRoutes from './ai'
const router = new Router()

router.get('/', (ctx) => {
    ctx.body = '🚀 欢迎来到 Koa 根路径'
})

// 合并其他模块路由
router.use(fileRoutes.routes(), fileRoutes.allowedMethods())
router.use(aiRoutes.routes(), aiRoutes.allowedMethods())
export default router
