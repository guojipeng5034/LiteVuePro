-- 按钮(type=3)的 parent 应为菜单(type=2)，非目录(type=1)
-- 将原 parent_id=1 的按钮调整到对应菜单下
UPDATE sys_menu SET parent_id = 111 WHERE permission IN ('system:dept:create','system:dept:update','system:dept:delete');
UPDATE sys_menu SET parent_id = 112 WHERE permission IN ('system:dict:create','system:dict:update','system:dict:delete','system:dict:export');
UPDATE sys_menu SET parent_id = 113 WHERE permission IN ('system:role:create','system:role:update','system:role:delete','system:role:export','system:permission:assign-role-menu','system:permission:assign-role-data-scope');
UPDATE sys_menu SET parent_id = 114 WHERE permission IN ('system:user:create','system:user:update','system:user:delete');
