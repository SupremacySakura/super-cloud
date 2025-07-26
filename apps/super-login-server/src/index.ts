import 'dotenv/config' // 最顶层引入，自动加载 .env
import Koa from 'koa'
import router from './routes'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import { requestLogger, responseLogger } from './middleware/logger'
const app = new Koa()
app.use(cors({
    origin: '*', // 允许所有来源，也可以设置为特定域名如 'http://localhost:5173'
    credentials: true, // 如果你前端要发送 cookie，就设为 true
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposeHeaders: ['Authorization'] // ✅ 关键：暴露 Authorization 响应头
}))
app.use(bodyParser())
app.use(requestLogger)
app.use(responseLogger)
app.use(router.routes())
app.use(router.allowedMethods())
const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
})
