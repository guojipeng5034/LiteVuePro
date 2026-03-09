-- 补充前端初始化用字典数据，与 dict.ts STATIC_DICT 对齐
INSERT INTO sys_dict_data (dict_type, label, value, sort, status, color_type) VALUES
('common_status', '启用', '0', 0, 0, 'success'),
('common_status', '关闭', '1', 1, 0, 'danger'),
('system_menu_type', '目录', '1', 0, 0, ''),
('system_menu_type', '菜单', '2', 1, 0, ''),
('system_menu_type', '按钮', '3', 2, 0, ''),
('system_role_type', '内置角色', '1', 0, 0, 'danger'),
('system_role_type', '自定义角色', '2', 1, 0, 'primary'),
('system_data_scope', '全部数据', '1', 0, 0, ''),
('system_data_scope', '本部门及以下', '2', 1, 0, ''),
('system_data_scope', '本部门', '3', 2, 0, ''),
('system_data_scope', '仅本人', '4', 3, 0, ''),
('system_data_scope', '自定义部门', '5', 4, 0, '');
