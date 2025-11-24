import Router from '@koa/router'
import { authMiddleware } from '../middleware/checkLogin'
import { buildMessageWithHistory, modelMap, models } from '../utils/ai'
import { Model } from '../utils/ai'
import { Message } from '../types/ai'

const checkApiUrl = 'http://localhost:3001/api/super-login/user/check'
const router = new Router({
    prefix: '/ai' // 所有 user 路由都会带上这个前缀
})
const messageMap = new Map<string, Message[]>()


router.get('/models', authMiddleware(checkApiUrl), async (ctx) => {
    ctx.body = { code: 200, message: '获取模型成功', data: models }
})
router.post('/chat', authMiddleware(checkApiUrl), async (ctx) => {
    // 获取用户发来的请求
    const { messages, model = models[0] } = ctx.request.body
    // 如果没有历史记录，就新建一个历史记录
    if (!messageMap.has(ctx.state.user.id)) {
        messageMap.set(ctx.state.user.id, [])
    }
    // 将用户的消息添加到历史记录中
    messageMap.get(ctx.state.user.id)?.push(...(messages as Message[]))
    // 开始处理请求
    const fullResponse: Message = { id: Date.now(), role: 'system', content: '', time: new Date().toISOString() }
    ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'close',
    })
    ctx.status = 200
    const write = (data: string) => {
        ctx.res.write(`data: ${data}\n\n`)
    }
    const fullMessage = buildMessageWithHistory(messageMap.get(ctx.state.user.id) || [], fullResponse)
    await modelMap[model as Model](fullMessage, (delta) => {
        write(delta)
        fullResponse.content += delta
    })
    // 将 AI 的回复添加到历史记录中
    messageMap.get(ctx.state.user.id)?.push(fullResponse)
    ctx.res.write('data: [DONE]\n\n')
    ctx.res.end()
})
router.get('/history', authMiddleware(checkApiUrl), (ctx) => {
    ctx.status = 200
    ctx.body = JSON.stringify({
        code: 200,
        message: '获取历史消息成功',
        data: messageMap.get(ctx.state.user.id) || []
    })
})

export default router