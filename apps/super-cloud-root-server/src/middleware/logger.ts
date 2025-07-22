import { Context, Next } from 'koa'

export async function requestLogger(ctx: Context, next: Next) {
    const start = Date.now()
    await next()
    const ms = Date.now() - start

    console.log(`\n--- Request Info ---
Method:  ${ctx.method}
URL:     ${ctx.url}
Status:  ${ctx.status}
Query:   ${JSON.stringify(ctx.query)}
Body:    ${JSON.stringify(ctx.request?.body)}
Time:    ${ms}ms
----------------------`)
}
export async function responseLogger(ctx: Context, next: Next) {
    const start = Date.now()
    await next()
    const ms = Date.now() - start

    console.log('----- 响应信息 -----')
    console.log(`响应状态码: ${ctx.status}`)
    console.log(`响应时间: ${ms}ms`)
    console.log(`响应体: ${JSON.stringify(ctx.body)}`)
    console.log('-------------------')
}

