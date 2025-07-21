CREATE TABLE IF NOT EXISTS user_sessions (
    sid VARCHAR(255) PRIMARY KEY,         -- 会话 ID
    user_id BIGINT NOT NULL,                 -- 用户 ID，关联 user_info 表
    username VARCHAR(100) NOT NULL,       -- 用户名（可冗余存储方便查询）
    email VARCHAR(255) NOT NULL,          -- 邮箱（可选冗余）
    avatar VARCHAR(500),                  -- 头像 URL，可选
    status TINYINT(1) DEFAULT 1,          -- 0: 禁用，1: 正常
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 会话创建时间
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 最近活动时间
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
