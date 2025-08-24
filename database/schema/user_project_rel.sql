-- 5. 用户-项目关联表
CREATE TABLE `user_project_rel` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID唯一标识',
  `user_id` VARCHAR(36) NOT NULL COMMENT '关联用户ID',
  `project_id` VARCHAR(36) NOT NULL COMMENT '关联项目ID',
  `role` ENUM('admin', 'developer') NOT NULL DEFAULT 'developer' COMMENT '在该项目上的权限',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_user_project` (`user_id`, `project_id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户-项目关联表';