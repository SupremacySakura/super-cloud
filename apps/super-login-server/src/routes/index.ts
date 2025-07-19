import Router from '@koa/router'
import userRoutes from './user'

const router = new Router()

router.get('/', (ctx) => {
    ctx.body = '🚀 欢迎来到 Koa 根路径'
})

// 合并其他模块路由
router.use(userRoutes.routes(), userRoutes.allowedMethods())

export default router
