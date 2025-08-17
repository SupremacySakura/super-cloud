import Router from '@koa/router'
import { sendVerificationEmail } from '../mail/index'
import pool from '../db/mysql'
import { RowDataPacket } from 'mysql2/promise'
import { createSession, getSession, deleteSession } from '../store/sessionStore'
// 登录类型接口
interface UserLogin {
    username: string,
    password: string
}
// 注册类型接口
interface UserRegister {
    username: string,
    password: string,
    email: string,
    code: string
}
// 发送验证码类型接口
interface sendVerificationCode {
    email: string
}
// 用户信息
export interface UserInfo {
    id: number,
    username: string,
    email: string,
    password: string,
    avatar?: string,
    status: 1 | 0, // 0: 禁用 1: 正常
    created_at: string,
    updated_at: string,
}
// SQL
const register = 'insert into users (username,password,email) values (?,?,?)'
const getUserByUsername = 'select * from users where username = ?'
// 验证码缓存
let verificationCodes = new Map()
const router = new Router({
    prefix: '/api/super-login/user' // 所有路由都会带上这个前缀
})
router.get('/', (ctx) => {
    ctx.body = '🚀 欢迎来到 Koa 根路径'
})
// 发送验证码
router.post('/sendVerificationCode', async (ctx) => {
    const { email } = ctx.request.body as sendVerificationCode
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    try {
        await sendVerificationEmail(email, code)
        verificationCodes.set(email, { code, expires: Date.now() + 10 * 60 * 1000 })
        ctx.body = ({ message: '验证码已发送', code: 200 })
    } catch (error) {
        ctx.status = 500
        ctx.body = ({ message: '发送失败', error, code: 500 })
    }
})
// 登录
router.post('/login', async (ctx) => {
    const { username, password } = ctx.request.body as UserLogin
    const [users] = await pool.query<RowDataPacket[]>(getUserByUsername, [username]);
    if (users.length === 0) {
        ctx.body = ({ message: '用户不存在', code: 404 })
        return
    }
    if (users[0].password !== password) {
        ctx.body = ({ message: '密码错误', code: 401 })
        return
    }
    const userInfo = { ...users[0], password: '' } as UserInfo
    const sid = await createSession(userInfo)
    if (!sid) {
        ctx.body = ({ message: '登录失败', code: 500 })
        return
    }
    ctx.set('Authorization', `Bearer ${sid}`)
    ctx.body = { message: '登录成功', code: 200, userInfo: userInfo }
})
// 注册
router.post('/register', async (ctx) => {
    const { username, password, email, code } = ctx.request.body as UserRegister
    // 验证码是否存在
    if (!verificationCodes.has(email)) {
        ctx.body = ({ message: '验证码已过期', code: 400 })
        return
    }
    // 验证码是否正确
    const verificationCode = verificationCodes.get(email)
    if (verificationCode.code !== code) {
        ctx.body = ({ message: '验证码错误', code: 400 })
        return
    } else if (Date.now() - verificationCode.expireTime > 10 * 60 * 1000) {
        ctx.body = ({ message: '验证码已过期', code: 400 })
        return
    }
    // 检查用户名是否存在
    const [users] = await pool.query<RowDataPacket[]>(getUserByUsername, [username]);

    if (users.length > 0) {
        ctx.body = ({ message: '用户名已存在', code: 400 })
        return
    }
    // 注册
    const [res] = await pool.query(register, [username, password, email])
    if (res) {
        ctx.body = ({ message: '注册成功', code: 200 })
    } else {
        ctx.body = ({ message: '注册失败', code: 500 })
    }
})
// 检验是否登录
router.get('/check', async (ctx) => {
    const sid = ctx.query.sid as string

    if (!sid) {
        ctx.body = { message: '未登录', code: 401 }
        return
    }

    const userInfo = await getSession(sid)
    if (!userInfo) {
        ctx.body = { message: '未登录', code: 401 }
        return
    }

    ctx.body = {
        message: '已登录',
        code: 200,
        data: userInfo
    }
})
// 登出
router.post('/logout', async (ctx) => {
    const authHeader = ctx.headers.authorization || ''
    const tokenMatch = authHeader.match(/^Bearer (.+)$/)
    const sid = tokenMatch ? tokenMatch[1] : null

    if (!sid) {
        ctx.body = { message: '未登录，缺少有效的token', code: 401 }
        return
    }

    try {
        await deleteSession(sid)
        ctx.body = {
            message: '已登出',
            code: 200
        }
    } catch (error) {
        console.error('登出失败:', error)
        ctx.body = {
            message: '登出失败',
            code: 500,
            error: error instanceof Error ? error.message : String(error)
        }
    }
})
export default router
