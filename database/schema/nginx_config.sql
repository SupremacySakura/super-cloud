-- 9. Nginx配置表
CREATE TABLE `nginx_config` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID唯一标识',
  `name` VARCHAR(100) NOT NULL COMMENT '配置名称',
  `server_name` VARCHAR(255) NOT NULL COMMENT '网站域名',
  `listen_port` INT NOT NULL DEFAULT 80 COMMENT '监听端口',
  `root_path` VARCHAR(255) NOT NULL COMMENT '网站根目录',
  `config_content` TEXT NOT NULL COMMENT '完整Nginx配置内容',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `last_applied_at` DATETIME NULL COMMENT '最后应用时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Nginx配置表';
