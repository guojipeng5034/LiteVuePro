-- LiteVuePro 用户表
CREATE TABLE sys_user (
  id           BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(64)  NOT NULL COMMENT '登录名',
  password_hash VARCHAR(128) NOT NULL COMMENT '密码 BCrypt 哈希',
  nickname     VARCHAR(64)  DEFAULT NULL COMMENT '昵称',
  email        VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
  avatar       VARCHAR(512) DEFAULT NULL COMMENT '头像 URL',
  dept_id      BIGINT       DEFAULT NULL COMMENT '部门 ID',
  status       TINYINT      NOT NULL DEFAULT 1 COMMENT '状态 0禁用 1正常',
  create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户';

-- 初始管理员 admin / 123456 (BCrypt cost 10)
INSERT INTO sys_user (username, password_hash, nickname, status) VALUES
('admin', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOoH2e7rJVPnN3kEj7/dGJVQf0KzQKJz2', '管理员', 1);
