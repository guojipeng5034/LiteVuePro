-- 将前端路由菜单结构同步到 sys_menu，供 GET /api/auth/menus 返回
-- 首页、Demo(及子)、系统管理(及子) 全量入库，角色1关联全部

-- 首页 (type 2 菜单)
INSERT INTO sys_menu (id, name, permission, type, sort, parent_id, path, icon, component, component_name, status, visible, keep_alive, always_show) VALUES
(100, '首页', NULL, 2, 1, 0, '/', 'mdi:home-outline', 'Home/Home', 'home', 0, 1, 1, 0);

-- Demo 目录及子菜单
INSERT INTO sys_menu (id, name, permission, type, sort, parent_id, path, icon, component, component_name, status, visible, keep_alive, always_show) VALUES
(101, '演示', NULL, 1, 2, 0, 'demo', 'mdi:view-dashboard-outline', '', '', 0, 1, 0, 1),
(102, '概览', NULL, 2, 1, 101, 'overview', 'mdi:view-dashboard', 'Demo/Overview', 'demo-overview', 0, 1, 1, 0),
(103, '时间', NULL, 2, 2, 101, 'time', 'mdi:clock-outline', 'Demo/Time', 'demo-time', 0, 0, 1, 0),
(104, 'Pinia', NULL, 2, 3, 101, 'pinia', 'mdi:database-outline', 'Demo/Pinia', 'demo-pinia', 0, 1, 1, 0),
(105, '日历', NULL, 2, 4, 101, 'calendar', 'mdi:calendar-month', 'Demo/Calendar', 'demo-calendar', 0, 1, 1, 0),
(106, '富文本', NULL, 2, 5, 101, 'richtext', 'mdi:format-bold', 'Demo/RichText', 'demo-richtext', 0, 1, 1, 0),
(107, '表单校验', NULL, 2, 6, 101, 'form-validation', 'mdi:form-textbox', 'Demo/FormValidation', 'demo-form-validation', 0, 1, 1, 0),
(108, '分步表单', NULL, 2, 7, 101, 'step-form', 'mdi:form-select', 'Demo/StepFormDemo', 'demo-step-form', 0, 1, 1, 0);

-- 系统管理子菜单（id 1 系统管理、2 菜单管理已存在，补齐 area/dept/dict/role/user）
INSERT INTO sys_menu (id, name, permission, type, sort, parent_id, path, icon, component, component_name, status, visible, keep_alive, always_show) VALUES
(110, '区域管理', NULL, 2, 2, 1, 'area', 'ep:location', 'system/area/index', 'system-area', 0, 1, 1, 0),
(111, '部门管理', NULL, 2, 3, 1, 'dept', 'ep:office-building', 'system/dept/index', 'system-dept', 0, 1, 1, 0),
(112, '字典管理', NULL, 2, 4, 1, 'dict', 'ep:collection', 'system/dict/index', 'system-dict', 0, 1, 1, 0),
(113, '角色管理', NULL, 2, 5, 1, 'role', 'ep:user', 'system/role/index', 'system-role', 0, 1, 1, 0),
(114, '用户管理', NULL, 2, 6, 1, 'user', 'ep:user-filled', 'system/user/index', 'system-user', 0, 1, 1, 0);

-- 角色 1 关联所有新菜单（100-114）
INSERT INTO sys_role_menu (role_id, menu_id) VALUES
(1, 100),
(1, 101), (1, 102), (1, 103), (1, 104), (1, 105), (1, 106), (1, 107), (1, 108),
(1, 110), (1, 111), (1, 112), (1, 113), (1, 114);
