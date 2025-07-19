export interface User {
    id: number,
    username: string,
    email: string,
    password: string,
    avatar?: string,
    status: 1 | 0, // 0: 禁用 1: 正常
    created_at: string,
    updated_at: string,
}