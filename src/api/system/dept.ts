/**
 * 系统管理 - 部门
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

export interface DeptVO {
  id: number;
  parentId: number;
  name: string;
  sort: number;
  leaderUserId?: number;
  phone?: string;
  email?: string;
  status: number;
  createTime?: string;
  children?: DeptVO[];
}

export interface DeptQueryParams {
  pageNo?: number;
  pageSize?: number;
  name?: string;
  status?: number;
}

/** 部门列表（分页/树用扁平列表） */
export function getDeptList(params?: DeptQueryParams) {
  return alovaInstance.Get<DeptVO[]>('/api/system/dept/list', { params }).send();
}

/** 部门详情 */
export function getDept(id: number) {
  return alovaInstance.Get<DeptVO>(`/api/system/dept/get?id=${id}`).send();
}

/** 简单部门列表（树用） */
export function getSimpleDeptList() {
  return alovaInstance.Get<DeptVO[]>('/api/system/dept/simple-list').send();
}

/** 新增部门 */
export function createDept(data: DeptVO) {
  return alovaInstance
    .Post<number>('/api/system/dept/create', data, { config: { dedupKey: 'dept-create' } })
    .send();
}

/** 修改部门 */
export function updateDept(data: DeptVO) {
  return alovaInstance.Put<void>('/api/system/dept/update', data).send();
}

/** 删除部门 */
export function deleteDept(id: number) {
  return alovaInstance.Delete<void>(`/api/system/dept/delete?id=${id}`).send();
}

/** 批量删除部门 */
export function deleteDeptList(ids: number[]) {
  return alovaInstance.Delete<void>('/api/system/dept/delete-list', {
    params: { ids: ids.join(',') },
  }).send();
}
