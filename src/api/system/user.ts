/**
 * 系统管理 - 用户
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

export interface UserVO {
  id: number;
  nickname: string;
  username?: string;
  deptName?: string;
  deptId?: number;
  mobile?: string;
  status?: number;
  createTime?: string;
  roleIds?: number[];
}

export interface UserSaveDTO {
  id?: number;
  username?: string;
  password?: string;
  nickname?: string;
  deptId?: number;
  mobile?: string;
  status?: number;
  roleIds?: number[];
}

export interface UserPageParams {
  pageNo: number;
  pageSize: number;
  username?: string;
  nickname?: string;
  status?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 分页查询用户列表 */
export function getUserPage(params: UserPageParams) {
  return alovaInstance.Get<PageResult<UserVO>>('/api/system/user/page', { params }).send();
}

/** 简单用户列表（用于负责人等下拉） */
export function getSimpleUserList() {
  return alovaInstance.Get<UserVO[]>('/api/system/user/simple-list').send();
}

/** 详情 */
export function getUser(id: number) {
  return alovaInstance.Get<UserVO>(`/api/system/user/get?id=${id}`).send();
}

/** 新增 */
export function createUser(data: UserSaveDTO) {
  return alovaInstance
    .Post<number>('/api/system/user/create', data, { config: { dedupKey: 'user-create' } })
    .send();
}

/** 修改 */
export function updateUser(data: UserSaveDTO) {
  return alovaInstance.Put<void>('/api/system/user/update', data).send();
}

/** 删除用户 */
export function deleteUser(id: number) {
  return alovaInstance.Delete<void>(`/api/system/user/delete?id=${id}`).send();
}
