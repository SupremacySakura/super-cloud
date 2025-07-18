import Koa from 'koa'
import router from './routes'

const app = new Koa()

app.use(router.routes())
app.use(router.allowedMethods())

const PORT = 3000
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`)
})
