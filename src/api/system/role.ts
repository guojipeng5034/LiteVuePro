/**
 * 系统管理 - 角色
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

export interface RoleVO {
  id: number;
  name: string;
  code: string;
  type?: number;
  sort?: number;
  status: number;
  remark?: string;
  createTime?: string;
  dataScope?: number;
  dataScopeDeptIds?: number[];
}

export interface RolePageParams {
  pageNo: number;
  pageSize: number;
  name?: string;
  code?: string;
  status?: number;
  createTime?: string[];
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 分页查询 */
export function getRolePage(params: RolePageParams) {
  return alovaInstance.Get<PageResult<RoleVO>>('/api/system/role/page', { params }).send();
}

/** 详情 */
export function getRole(id: number) {
  return alovaInstance.Get<RoleVO>(`/api/system/role/get?id=${id}`).send();
}

/** 新增 */
export function createRole(data: RoleVO) {
  return alovaInstance
    .Post<number>('/api/system/role/create', data, { config: { dedupKey: 'role-create' } })
    .send();
}

/** 修改 */
export function updateRole(data: RoleVO) {
  return alovaInstance.Put<void>('/api/system/role/update', data).send();
}

/** 删除 */
export function deleteRole(id: number) {
  return alovaInstance.Delete<void>(`/api/system/role/delete?id=${id}`).send();
}

/** 批量删除 */
export function deleteRoleList(ids: number[]) {
  return alovaInstance.Delete<void>('/api/system/role/delete-list', {
    params: { ids: ids.join(',') },
  }).send();
}

/** 导出 */
export function exportRole(params: RolePageParams) {
  return alovaInstance.Get<Blob>('/api/system/role/export', { params, responseType: 'blob' }).send();
}
