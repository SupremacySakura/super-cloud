import Router from '@koa/router'
import { sendVerificationEmail } from '../mail/index'
import pool from '../db/mysql'
import { RowDataPacket } from 'mysql2/promise'
import crypto from 'crypto'
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
// SQL
const register = 'insert into users (username,password,email) values (?,?,?)'
const getUserByUsername = 'select * from users where username = ?'
// 验证码缓存
let verificationCodes = new Map()
const router = new Router({
    prefix: '/user' // 所有 user 路由都会带上这个前缀
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
    const sid = crypto.randomBytes(16).toString('hex') // 32 字符长十六进制字符串
    ctx.set('Authorization', `Bearer ${sid}`)
    ctx.body = { message: '登录成功', code: 200, userInfo: { ...users[0], password: '' } }
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
export default router
