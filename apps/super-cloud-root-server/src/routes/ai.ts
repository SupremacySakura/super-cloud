import Router from '@koa/router';
import { authMiddleware } from '../middleware/checkLogin';
import { modelMap, models } from '../utils/ai'
import { Model } from '../utils/ai';


const checkApiUrl = 'http://localhost:3001/api/super-login/user/check'
const router = new Router({
    prefix: '/api/super-cloud/ai' // 所有 user 路由都会带上这个前缀
})
router.get('/models', authMiddleware(checkApiUrl), async (ctx) => {
    ctx.body = { code: 200, message: '获取模型成功', data: models }
})
router.post('/chat', authMiddleware(checkApiUrl), async (ctx) => {
    const { messages, model = models[0] } = ctx.request.body;
    const completion = await modelMap[model as Model](messages)
    ctx.body = { code: 200, message: '发送信息成功', data: completion };
})
export default router