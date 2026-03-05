/**
 * 系统管理 - 权限（角色菜单/数据权限）
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

/** 角色菜单 ID 列表 */
export function getRoleMenuList(roleId: number) {
  return alovaInstance.Get<number[]>(`/api/system/permission/role-menu-ids?roleId=${roleId}`).send();
}

/** 分配角色菜单 */
export function assignRoleMenu(data: { roleId: number; menuIds: number[] }) {
  return alovaInstance.Put<void>('/api/system/permission/assign-role-menu', data).send();
}

/** 分配角色数据权限 */
export function assignRoleDataScope(data: {
  roleId: number;
  dataScope: number;
  dataScopeDeptIds?: number[];
}) {
  return alovaInstance.Put<void>('/api/system/permission/assign-role-data-scope', data).send();
}
