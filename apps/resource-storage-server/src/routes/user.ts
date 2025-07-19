import Router from '@koa/router'
interface UserLogin {
    username: string,
    password: string
}
const router = new Router({
    prefix: '/user' // 所有 user 路由都会带上这个前缀
})

router.get('/', async (ctx) => {
    ctx.body = '获取用户列表'
}) 
router.post('/login', async (ctx) => {
    const data = ctx.request.body as UserLogin
    console.log(data)
})
router.get('/:id', async (ctx) => {
    const { id } = ctx.params
    ctx.body = `获取用户信息，ID: ${id}`
})

export default router
