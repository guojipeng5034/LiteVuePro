-- LiteVuePro 数据库初始化（仅创建库，表由 Flyway 迁移创建）
-- 用法: mysql -u root -p < backend/db/init-all.sql
CREATE DATABASE IF NOT EXISTS litevuepro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
