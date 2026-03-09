CREATE TABLE sys_dept (
  id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id     BIGINT       NOT NULL DEFAULT 0,
  name          VARCHAR(64)  NOT NULL,
  sort          INT          NOT NULL DEFAULT 0,
  leader_user_id BIGINT       DEFAULT NULL,
  phone         VARCHAR(32)  DEFAULT NULL,
  email         VARCHAR(128) DEFAULT NULL,
  status        TINYINT      NOT NULL DEFAULT 0,
  create_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_time   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门';

INSERT INTO sys_dept (id, parent_id, name, sort, status) VALUES
(1, 0, '总公司', 0, 0),
(2, 1, '研发部', 1, 0),
(3, 1, '市场部', 2, 0);
