import type { UserInfo } from "../routes/user"
const sessionMap: Map<string, UserInfo> = new Map()

export function createSession(userInfo:UserInfo): string {
    const sid = crypto.randomUUID()
    sessionMap.set(sid, userInfo)
    return sid
}

export function getSession(sid: string): UserInfo | null {
    const session = sessionMap.get(sid)
    if (!session) return null
    return session
}

export function deleteSession(sid: string) {
    sessionMap.delete(sid)
}
