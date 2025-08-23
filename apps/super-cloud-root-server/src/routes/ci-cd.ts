import Router from '@koa/router';
import path from 'path';
import { randomUUID } from 'crypto';
import { authMiddleware, UserInfo } from '../middleware/checkLogin';
import pool from '../db/mysql'

// SQL
const getServerByUserId = `
  SELECT
    s.id AS server_id,
    s.name,
    s.host,
    s.port,
    s.username,
    s.description,
    s.status,
    s.last_check_time,
    s.created_at,
    s.updated_at,
    r.role,
    r.user_id
FROM server s
INNER JOIN user_server_rel r
    ON s.id = r.server_id
WHERE r.user_id = ?


`
const uploadServer = `
       INSERT INTO server (
        id,
        name,
        host,
        port,
        username,
        password,
        private_key,
        passphrase,
        description,
        status,
        last_check_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`
const uploadUserServerRel = `
    INSERT INTO user_server_rel (
        id,
        user_id,
        server_id,
        role
    ) VALUES (?,?,?,?)
`
const checkApiUrl = 'http://localhost:3001/api/super-login/user/check'
const router = new Router({
    prefix: '/ci-cd' // 所有 user 路由都会带上这个前缀
})
// 获取服务器
router.get('/getServer', authMiddleware(checkApiUrl), async (ctx) => {
    const user = ctx.state.user as UserInfo;

    try {
        const [server] = await pool.query(getServerByUserId, [user.id]);
        ctx.body = {
            code: 200,
            message: '获取服务器信息成功',
            data: server,
        };
    } catch (error) {
        console.error('获取服务器信息失败:', error);
        ctx.body = {
            code: 500,
            message: '服务器内部错误，请稍后再试',
            error: (error as Error).message, // 开发环境可返回具体错误，生产环境可移除
        };
    }
})
// 上传服务器
router.post('/uploadServer', authMiddleware(checkApiUrl), async (ctx) => {
    const connection = await pool.getConnection(); // 获取连接
    try {
        await connection.beginTransaction(); // 开启事务

        const { serverInfo } = ctx.request.body;
        const serverUUID = randomUUID();
        const relUUID = randomUUID();

        // 第一个 SQL
        const [result] = await connection.query(uploadServer, [serverUUID, ...Object.values(serverInfo)]);

        // 第二个 SQL
        const [result2] = await connection.query(uploadUserServerRel, [relUUID, ctx.state.user.id, serverUUID, 'admin']);

        // 提交事务
        await connection.commit();

        ctx.body = {
            code: 200,
            message: '上传成功',
            data: { result, result2 },
        };
    } catch (error) {
        // 回滚事务
        await connection.rollback();
        console.error('上传服务器信息失败:', error);
        ctx.body = {
            code: 500,
            message: '服务器内部错误，请稍后再试',
        };
    } finally {
        connection.release(); // 释放连接
    }
})
export default router
