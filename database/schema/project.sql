-- 3. 项目表
CREATE TABLE `project` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID唯一标识',
  `name` VARCHAR(100) NOT NULL COMMENT '项目名称',
  `description` TEXT NULL COMMENT '项目描述',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `git_repo_id` VARCHAR(36) NULL COMMENT '关联Git仓库ID',
  `deployment_config_id` VARCHAR(36) NULL COMMENT '关联部署配置ID',
  `server_id` VARCHAR(36) NULL COMMENT '关联服务器ID',
  `created_by` VARCHAR(36) NOT NULL COMMENT '创建者ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_name` (`name`),
  INDEX `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';