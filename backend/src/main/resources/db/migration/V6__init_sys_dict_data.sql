-- 字典数据表
CREATE TABLE sys_dict_data (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dict_type     VARCHAR(64)  NOT NULL COMMENT '字典类型',
  label         VARCHAR(64)  NOT NULL COMMENT '字典标签',
  value         VARCHAR(64)  NOT NULL COMMENT '字典值',
  sort          INT          NOT NULL DEFAULT 0 COMMENT '排序',
  status        TINYINT      NOT NULL DEFAULT 0 COMMENT '0启用 1禁用',
  color_type    VARCHAR(32)  DEFAULT NULL COMMENT '颜色类型',
  css_class     VARCHAR(64)  DEFAULT NULL COMMENT '样式类名',
  remark        VARCHAR(256) DEFAULT NULL COMMENT '备注',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_dict_type (dict_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典数据';

INSERT INTO sys_dict_data (dict_type, label, value, sort, status) VALUES
('sys_user_sex', '男', '1', 1, 0),
('sys_user_sex', '女', '2', 2, 0),
('sys_status', '正常', '0', 1, 0),
('sys_status', '禁用', '1', 2, 0);
