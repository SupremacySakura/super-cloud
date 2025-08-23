-- 2. 服务器表
CREATE TABLE `server` (
  `id` VARCHAR(36) NOT NULL COMMENT 'UUID唯一标识',
  `name` VARCHAR(100) NOT NULL COMMENT '服务器名称',
  `host` VARCHAR(100) NOT NULL COMMENT 'IP地址或域名',
  `port` INT NOT NULL DEFAULT 22 COMMENT 'SSH端口',
  `username` VARCHAR(50) NOT NULL COMMENT 'SSH登录用户名',
  `password` TEXT NULL COMMENT 'SSH密码',
  `private_key` TEXT NULL COMMENT 'SSH私钥(Base64编码)',
  `passphrase` VARCHAR(100) NULL COMMENT '私钥密码',
  `description` TEXT NULL COMMENT '描述信息',
  `status` ENUM('online', 'offline', 'error') NOT NULL DEFAULT 'offline' COMMENT '状态',
  `last_check_time` DATETIME NULL COMMENT '最后检查时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_host_port` (`host`, `port`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务器表';
