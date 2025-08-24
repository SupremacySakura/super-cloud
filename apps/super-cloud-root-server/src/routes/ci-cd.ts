import Router from '@koa/router';
import path from 'path';
import { randomUUID } from 'crypto';
import { authMiddleware, UserInfo } from '../middleware/checkLogin';
import pool from '../db/mysql'
import { createSSHClient } from '../server/ssh'
import { Server } from '../types/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
// SQL
const getServerByUserId = `
  SELECT
    s.id,
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
const getServerPasswordById = `
    SELECT password FROM server WHERE id = ?
`
const getServerPrivateKeyById = `
    SELECT private_key,passphrase FROM server WHERE id = ?
`
const updateServer = `
    UPDATE server SET
        name = ?,
        host = ?,
        port = ?,
        username = ?,
        description = ?
    WHERE id = ?
`

// 项目相关SQL
const getProjectsByUserId = `
  SELECT
    p.id,
    p.name,
    p.description,
    p.status,
    p.git_repo_id,
    p.created_by,
    p.created_at,
    p.updated_at,
    r.role
  FROM project p
  INNER JOIN user_project_rel r
    ON p.id = r.project_id
  WHERE r.user_id = ?
  ORDER BY p.created_at DESC
`

const insertProject = `
  INSERT INTO project (
    id,
    name,
    description,
    status,
    git_repo_id,
    deployment_config_id,
    created_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`

const insertUserProjectRel = `
  INSERT INTO user_project_rel (
    id,
    user_id,
    project_id,
    role
  ) VALUES (?, ?, ?, ?)
`

const checkProjectNameExists = `
  SELECT id FROM project WHERE name = ?
`

// 部署配置相关SQL
const insertDeploymentConfig = `
  INSERT INTO deployment_config (
    id,
    project_id,
    name,
    deployment_path,
    build_command,
    start_command,
    stop_command,
    restart_command,
    build_output_dir,
    pre_deploy_script,
    post_deploy_script,
    env_variables,
    auto_deploy,
    auto_rollback
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`

// Nginx配置相关SQL
const insertNginxConfig = `
  INSERT INTO nginx_config (
    id,
    name,
    server_name,
    listen_port,
    root_path,
    config_content,
    enabled
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`

const updateProjectDeploymentConfig = `
  UPDATE project SET deployment_config_id = ? WHERE id = ?
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
// 连接服务器
router.post('/connectServer', async (ctx) => {
    const serverInfo = ctx.request.body.serverInfo as Server
    const model = ctx.request.body.model as 'password' | 'privateKey'

    let password, private_key, passphrase
    switch (model) {
        case 'password':
            try {
                const [rows1] = await pool.query<RowDataPacket[]>(getServerPasswordById, [serverInfo.id])
                password = rows1[0].password
            } catch (err) {
                return ctx.body = { code: 500, message: '服务器错误', data: `${err}` }
            }
            break;
        case 'privateKey':
            try {
                const [rows2] = await pool.query<RowDataPacket[]>(getServerPrivateKeyById, [serverInfo.id])
                private_key = rows2[0].private_key
                passphrase = rows2[0].passphrase
            } catch (err) {
                return ctx.body = { code: 500, message: '服务器错误', data: `${err}` }
            }
            break;
    }
    try {
        const ssh = await createSSHClient({
            host: serverInfo.host,
            username: serverInfo.username,
            password,
            privateKey: private_key,
            passphrase
        }, model
        )
        ssh.dispose()
    } catch (err) {
        return ctx.body = { code: 500, message: '服务器错误', data: `${err}` }
    }
    ctx.body = {
        code: 200,
        message: '连接成功',
        data: `✅ 已连接到 ${serverInfo.host} (${model} 模式)`
    }
})
// 更新服务器信息
router.post('/updateServer', async (ctx) => {
    const serverInfo = ctx.request.body.serverInfo as Server
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            updateServer,
            [
                serverInfo.name,
                serverInfo.host,
                serverInfo.port,
                serverInfo.username,
                serverInfo.description,
                serverInfo.id
            ]
        )
        ctx.body = {
            code: 200,
            message: '更新成功',
            data: rows
        }
    } catch (err) {
        ctx.body = { code: 500, message: '服务器错误', data: `${err}` }
    }
})
// 获取用户项目列表
router.get('/getProjects', authMiddleware(checkApiUrl), async (ctx) => {
    const user = ctx.state.user as UserInfo;

    try {
        const [projects] = await pool.query<RowDataPacket[]>(getProjectsByUserId, [user.id]);
        ctx.body = {
            code: 200,
            message: '获取项目列表成功',
            data: projects,
        };
    } catch (error) {
        console.error('获取项目列表失败:', error);
        ctx.body = {
            code: 500,
            message: '服务器内部错误，请稍后再试',
            error: (error as Error).message,
        };
    }
})

// 上传/创建项目
router.post('/uploadProject', authMiddleware(checkApiUrl), async (ctx) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { projectInfo, deploymentConfig, nginxConfig } = ctx.request.body;
        const user = ctx.state.user as UserInfo;

        // 检查项目名称是否已存在
        const [existingProjects] = await connection.query<RowDataPacket[]>(checkProjectNameExists, [projectInfo.name]);
        if (existingProjects.length > 0) {
            await connection.rollback();
            return ctx.body = {
                code: 400,
                message: '项目名称已存在',
            };
        }

        const projectUUID = randomUUID();
        const relUUID = randomUUID();
        const deploymentConfigUUID = randomUUID();
        const nginxConfigUUID = randomUUID();

        // 先插入部署配置
        await connection.query(insertDeploymentConfig, [
            deploymentConfigUUID,
            projectUUID,
            deploymentConfig?.name || '默认配置',
            deploymentConfig?.deployment_path || '/var/www/html',
            deploymentConfig?.build_command || 'npm run build',
            deploymentConfig?.start_command || 'npm start',
            deploymentConfig?.stop_command || 'npm stop',
            deploymentConfig?.restart_command || 'npm restart',
            deploymentConfig?.build_output_dir || 'dist',
            deploymentConfig?.pre_deploy_script || '',
            deploymentConfig?.post_deploy_script || '',
            deploymentConfig?.env_variables ? JSON.stringify(deploymentConfig.env_variables) : '{}',
            deploymentConfig?.auto_deploy ? 1 : 0,
            deploymentConfig?.auto_rollback ? 1 : 0
        ]);

        // 插入Nginx配置
        await connection.query(insertNginxConfig, [
            nginxConfigUUID,
            nginxConfig?.name || '默认Nginx配置',
            nginxConfig?.server_name || 'example.com',
            nginxConfig?.listen_port || 80,
            nginxConfig?.root_path || '/var/www/html',
            nginxConfig?.config_content || '',
            nginxConfig?.enabled ? 1 : 0
        ]);

        // 插入项目信息 - 使用下划线字段名，包含部署配置ID和Nginx配置ID
        await connection.query(insertProject, [
            projectUUID,
            projectInfo.name,
            projectInfo.description || null,
            projectInfo.status || 'active',
            projectInfo.git_repo_id || null,
            deploymentConfigUUID, // deployment_config_id
            nginxConfigUUID, // nginx_config_id
            user.id
        ]);

        // 插入用户-项目关联
        await connection.query(insertUserProjectRel, [
            relUUID,
            user.id,
            projectUUID,
            'admin' // 创建者默认为管理员
        ]);

        await connection.commit();

        ctx.body = {
            code: 200,
            message: '项目创建成功',
            data: {
                projectId: projectUUID,
                deploymentConfigId: deploymentConfigUUID
            },
        };
    } catch (error) {
        await connection.rollback();
        console.error('创建项目失败:', error);
        ctx.body = {
            code: 500,
            message: '服务器内部错误，请稍后再试',
            error: (error as Error).message,
        };
    } finally {
        connection.release();
    }
})

export default router
