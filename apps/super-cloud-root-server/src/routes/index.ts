import Router from '@koa/router'
import fileRoutes from './file'
import aiRoutes from './ai'
import cicdRoutes from './ci-cd'
const router = new Router({
    prefix: '/api/super-cloud'
})

router.get('/', (ctx) => {
    ctx.body = '🚀 欢迎来到 Koa 根路径'
})

// 合并其他模块路由
router.use(fileRoutes.routes(), fileRoutes.allowedMethods())
router.use(aiRoutes.routes(), aiRoutes.allowedMethods())
router.use(cicdRoutes.routes(), cicdRoutes.allowedMethods())
export default router
