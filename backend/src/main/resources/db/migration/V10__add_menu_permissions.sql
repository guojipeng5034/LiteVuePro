-- 为管理员角色补充按钮级权限（type=3），与前端 v-permission 对齐
-- 插入按钮菜单并关联到角色 1（管理员）
INSERT INTO sys_menu (name, permission, type, sort, parent_id, path, icon, component, component_name, status, visible, keep_alive, always_show) VALUES
('菜单新增', 'system:menu:create', 3, 1, 2, '', '', '', '', 0, 1, 0, 0),
('菜单修改', 'system:menu:update', 3, 2, 2, '', '', '', '', 0, 1, 0, 0),
('菜单删除', 'system:menu:delete', 3, 3, 2, '', '', '', '', 0, 1, 0, 0),
('部门新增', 'system:dept:create', 3, 1, 1, '', '', '', '', 0, 1, 0, 0),
('部门修改', 'system:dept:update', 3, 2, 1, '', '', '', '', 0, 1, 0, 0),
('部门删除', 'system:dept:delete', 3, 3, 1, '', '', '', '', 0, 1, 0, 0),
('字典新增', 'system:dict:create', 3, 1, 1, '', '', '', '', 0, 1, 0, 0),
('字典修改', 'system:dict:update', 3, 2, 1, '', '', '', '', 0, 1, 0, 0),
('字典删除', 'system:dict:delete', 3, 3, 1, '', '', '', '', 0, 1, 0, 0),
('字典导出', 'system:dict:export', 3, 4, 1, '', '', '', '', 0, 1, 0, 0),
('角色新增', 'system:role:create', 3, 1, 1, '', '', '', '', 0, 1, 0, 0),
('角色修改', 'system:role:update', 3, 2, 1, '', '', '', '', 0, 1, 0, 0),
('角色删除', 'system:role:delete', 3, 3, 1, '', '', '', '', 0, 1, 0, 0),
('角色导出', 'system:role:export', 3, 4, 1, '', '', '', '', 0, 1, 0, 0),
('角色菜单', 'system:permission:assign-role-menu', 3, 5, 1, '', '', '', '', 0, 1, 0, 0),
('数据权限', 'system:permission:assign-role-data-scope', 3, 6, 1, '', '', '', '', 0, 1, 0, 0),
('用户新增', 'system:user:create', 3, 1, 1, '', '', '', '', 0, 1, 0, 0),
('用户修改', 'system:user:update', 3, 2, 1, '', '', '', '', 0, 1, 0, 0),
('用户删除', 'system:user:delete', 3, 3, 1, '', '', '', '', 0, 1, 0, 0);

-- 角色 1 关联所有新按钮菜单
INSERT INTO sys_role_menu (role_id, menu_id)
SELECT 1, id FROM sys_menu
WHERE permission IN (
  'system:menu:create','system:menu:update','system:menu:delete',
  'system:dept:create','system:dept:update','system:dept:delete',
  'system:dict:create','system:dict:update','system:dict:delete','system:dict:export',
  'system:role:create','system:role:update','system:role:delete','system:role:export',
  'system:permission:assign-role-menu','system:permission:assign-role-data-scope',
  'system:user:create','system:user:update','system:user:delete'
);
