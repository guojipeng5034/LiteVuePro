/** 通用状态：启用/关闭 */
export const CommonStatusEnum = {
  ENABLE: 0,
  DISABLE: 1,
} as const;

/** 系统菜单类型：目录/菜单/按钮 */
export const SystemMenuTypeEnum = {
  DIR: 1,
  MENU: 2,
  BUTTON: 3,
} as const;

/** 数据权限范围 */
export const SystemDataScopeEnum = {
  ALL: 1,
  DEPT_AND_CHILD: 2,
  DEPT: 3,
  SELF: 4,
  DEPT_CUSTOM: 5,
} as const;
