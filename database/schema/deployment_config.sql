-- 8. 部署配置表
CREATE TABLE `deployment_config` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID唯一标识',
  `project_id` VARCHAR(36) NOT NULL COMMENT '关联项目ID',
  `name` VARCHAR(100) NOT NULL COMMENT '配置名称',
  `deployment_path` VARCHAR(255) NOT NULL COMMENT '服务器部署路径',
  `build_command` TEXT NULL COMMENT '构建命令',
  `start_command` TEXT NULL COMMENT '启动命令',
  `stop_command` TEXT NULL COMMENT '停止命令',
  `restart_command` TEXT NULL COMMENT '重启命令',
  `build_output_dir` VARCHAR(255) NULL COMMENT '构建输出目录',
  `pre_deploy_script` TEXT NULL COMMENT '部署前脚本',
  `post_deploy_script` TEXT NULL COMMENT '部署后脚本',
  `env_variables` TEXT NULL COMMENT '环境变量(JSON格式)',
  `auto_deploy` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动部署',
  `auto_rollback` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '部署失败是否自动回滚',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部署配置表';