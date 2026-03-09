-- 字典类型表
CREATE TABLE sys_dict_type (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(64)  NOT NULL COMMENT '字典名称',
  type          VARCHAR(64)  NOT NULL COMMENT '字典类型',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0启用 1禁用',
  remark        VARCHAR(256) DEFAULT NULL COMMENT '备注',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典类型';

INSERT INTO sys_dict_type (name, type, status) VALUES
('用户性别', 'sys_user_sex', 0),
('系统状态', 'sys_status', 0);
