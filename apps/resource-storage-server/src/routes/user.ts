import Router from '@koa/router'

const router = new Router({
    prefix: '/user' // 所有 user 路由都会带上这个前缀
})

router.get('/', async (ctx) => {
    ctx.body = '获取用户列表'
})

router.get('/:id', async (ctx) => {
    const { id } = ctx.params
    ctx.body = `获取用户信息，ID: ${id}`
})

export default router
