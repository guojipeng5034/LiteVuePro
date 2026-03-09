CREATE TABLE sys_menu (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(64)  NOT NULL COMMENT '菜单名称',
  permission    VARCHAR(128) DEFAULT NULL COMMENT '权限标识',
  type          TINYINT      NOT NULL COMMENT '1目录 2菜单 3按钮',
  sort          INT          NOT NULL DEFAULT 0 COMMENT '排序',
  parent_id     BIGINT       NOT NULL DEFAULT 0 COMMENT '父菜单ID',
  path          VARCHAR(256) NOT NULL DEFAULT '' COMMENT '路由路径',
  icon          VARCHAR(64)  DEFAULT NULL COMMENT '图标',
  component     VARCHAR(256) DEFAULT NULL COMMENT '组件路径',
  component_name VARCHAR(64)  DEFAULT NULL COMMENT '路由name',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0启用 1禁用',
  visible       TINYINT      NOT NULL DEFAULT 1 COMMENT '是否显示',
  keep_alive    TINYINT      NOT NULL DEFAULT 1 COMMENT '是否缓存',
  always_show   TINYINT      NOT NULL DEFAULT 0 COMMENT '总是显示',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单';

INSERT INTO sys_menu (id, name, type, sort, parent_id, path, icon, component, component_name, status, visible, keep_alive, always_show) VALUES
(1, '系统管理', 1, 10, 0, '/system', 'ep:setting', '', '', 0, 1, 0, 1),
(2, '菜单管理', 2, 1, 1, 'menu', 'ep:menu', 'system/menu/index', 'system-menu', 0, 1, 1, 0);
