-- 地区表（树形）
CREATE TABLE sys_area (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id     BIGINT       NOT NULL DEFAULT 0 COMMENT '父级ID',
  name          VARCHAR(64)  NOT NULL COMMENT '地区名称',
  sort          INT          NOT NULL DEFAULT 0 COMMENT '排序',
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='地区';

INSERT INTO sys_area (id, parent_id, name, sort) VALUES
(1, 0, '中国', 0),
(2, 1, '北京市', 1),
(3, 1, '上海市', 2),
(4, 1, '广东省', 3),
(5, 4, '广州市', 1),
(6, 4, '深圳市', 2);
