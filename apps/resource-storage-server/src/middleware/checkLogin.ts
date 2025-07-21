import Koa from 'koa'
import axios from 'axios'

interface UserInfo {
    id: number
    username: string
    email: string
    avatar?: string
    status: 1 | 0
    created_at: string
    updated_at: string
}

export const authMiddleware = (checkApiUrl: string) => {
    return async (ctx: Koa.Context, next: Koa.Next) => {
        try {
            // 从请求头 Authorization 里拿 token，格式: Bearer <sid>
            const authHeader = ctx.headers['authorization'] || ''
            const sid = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

            if (!sid) {
                ctx.status = 401
                ctx.body = { message: '缺少登录凭证' }
                return
            }

            // 调用认证服务器接口验证 sid 是否有效
            const res = await axios.get(checkApiUrl, {
                params: { sid }
            })

            if (res.data.code !== 200) {
                ctx.status = 401
                ctx.body = { message: '未登录或登录已失效' }
                return
            }

            // 将用户信息挂载到 ctx.state，方便后续中间件或路由使用
            ctx.state.user = res.data.data as UserInfo

            await next()
        } catch (error) {
            console.error('认证中间件错误:', error)
            ctx.status = 401
            ctx.body = { message: '认证失败' }
        }
    }
}
