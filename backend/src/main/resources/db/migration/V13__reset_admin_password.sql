-- 重置 admin 密码为 123456（BCrypt cost 10，与 V1 一致）
UPDATE sys_user SET password_hash = '$2a$10$8K1p/a0dL1LXMIgoEDFrwOoH2e7rJVPnN3kEj7/dGJVQf0KzQKJz2'
WHERE username = 'admin';
