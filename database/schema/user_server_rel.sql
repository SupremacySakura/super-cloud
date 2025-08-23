-- 4. 用户-服务器关联表
CREATE TABLE `user_server_rel` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID唯一标识',
  `user_id` VARCHAR(36) NOT NULL COMMENT '关联用户ID',
  `server_id` VARCHAR(36) NOT NULL COMMENT '关联服务器ID',
  `role` ENUM('admin', 'operator') NOT NULL DEFAULT 'operator' COMMENT '在该服务器上的权限',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_user_server` (`user_id`, `server_id`),
  INDEX `idx_server_id` (`server_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-服务器关联表';
