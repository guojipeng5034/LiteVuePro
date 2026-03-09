-- 用户角色关联表
CREATE TABLE sys_user_role (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_id (user_id),
  KEY idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联';

-- sys_user 增加 mobile 字段
ALTER TABLE sys_user ADD COLUMN mobile VARCHAR(20) DEFAULT NULL COMMENT '手机号' AFTER avatar;

-- 管理员关联管理员角色
INSERT INTO sys_user_role (user_id, role_id) VALUES (1, 1);
