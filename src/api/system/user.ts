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
  mobile?: string;
  status?: number;
  createTime?: string;
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

/** 删除用户 */
export function deleteUser(id: number) {
  return alovaInstance.Delete<void>(`/api/system/user/delete?id=${id}`).send();
}
