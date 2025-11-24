import type { UserInfo } from "../routes/user"
import pool from "../db/mysql"

const sessionMap: Map<string, UserInfo> = new Map()
const insertSession = `
    INSERT INTO user_sessions (
      sid, user_id, username, email, avatar, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
  `
const querySession = `
    SELECT * FROM user_sessions WHERE sid = ? LIMIT 1
  `
const deleteSessionSql = 'DELETE FROM user_sessions WHERE sid = ?'
export const createSession = async (userInfo: UserInfo): Promise<string> => {
    const sid = crypto.randomUUID()
    sessionMap.set(sid, userInfo)

    try {
        const [result] = await pool.query(insertSession, [
            sid,
            userInfo.id,
            userInfo.username,
            userInfo.email,
            userInfo.avatar ?? null,
            userInfo.status,
            userInfo.created_at,
            userInfo.updated_at
        ])

        const { affectedRows } = result as any
        if (affectedRows === 0) {
            sessionMap.delete(sid)
            return ''
        }

        return sid
    } catch {
        sessionMap.delete(sid)
        return ''
    }
}

export const getSession = async (sid: string): Promise<UserInfo | null | false> => {
    const session = sessionMap.get(sid)
    if (session) return session

    try {
        const [rows] = await pool.query(
            querySession,
            [sid]
        )

        const result = (rows as any[])[0]
        if (!result) return false

        // 可选：同步内存中的 sessionMap
        sessionMap.set(sid, {
            id: result.user_id,
            username: result.username,
            email: result.email,
            avatar: result.avatar,
            status: result.status,
            created_at: result.created_at,
            updated_at: result.updated_at,
            password: ''
        })

        return sessionMap.get(sid) ?? null
    } catch {
        return false
    }
}

export const deleteSession = async (sid: string): Promise<void> => {
    sessionMap.delete(sid)

    try {
        await pool.query('DELETE FROM user_sessions WHERE sid = ?', [sid])
    } catch (error) {
        console.error('删除 session 失败:', error)
    }
}
