-- 角色表
CREATE TABLE sys_role (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(64)  NOT NULL COMMENT '角色名称',
  code          VARCHAR(64)  NOT NULL COMMENT '角色编码',
  type          TINYINT      DEFAULT NULL COMMENT '角色类型',
  sort          INT          NOT NULL DEFAULT 0 COMMENT '排序',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0启用 1禁用',
  remark        VARCHAR(256) DEFAULT NULL COMMENT '备注',
  data_scope    TINYINT      DEFAULT 1 COMMENT '数据权限 1全部 2本部门 3本部门及子 4自定义 5本人',
  data_scope_dept_ids JSON   DEFAULT NULL COMMENT '数据权限部门ID列表',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色';

INSERT INTO sys_role (id, name, code, type, sort, status) VALUES
(1, '管理员', 'admin', 1, 0, 0);
