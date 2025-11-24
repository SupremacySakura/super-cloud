export interface Server {
    id?: string                // UUID，唯一标识
    name: string              // 服务器名称
    host: string              // IP地址或域名
    port: number              // SSH端口，默认 22
    username: string          // SSH 登录用户名
    password?: string         // SSH 密码（可选）
    private_key?: string       // SSH 私钥（Base64 编码，可选）
    passphrase?: string       // 私钥密码（可选）
    description?: string      // 描述信息
    status: "online" | "offline" | "error"  // 状态
    last_check_time?: string      // 最后检查时间
    created_at: string
    updated_at: string
}