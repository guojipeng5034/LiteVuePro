/**
 * 系统管理 - 字典类型
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

export interface DictTypeVO {
  id: number;
  name: string;
  type: string;
  status: number;
  remark?: string;
  createTime?: string;
}

export interface DictTypePageParams {
  pageNo: number;
  pageSize: number;
  name?: string;
  type?: string;
  status?: number;
  createTime?: string[];
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 分页查询 */
export function getDictTypePage(params: DictTypePageParams) {
  return alovaInstance.Get<PageResult<DictTypeVO>>('/api/system/dict-type/page', { params }).send();
}

/** 详情 */
export function getDictType(id: number) {
  return alovaInstance.Get<DictTypeVO>(`/api/system/dict-type/get?id=${id}`).send();
}

/** 简单列表 */
export function getSimpleDictTypeList() {
  return alovaInstance.Get<DictTypeVO[]>('/api/system/dict-type/simple-list').send();
}

/** 新增（dedupKey 500ms 内防重复提交） */
export function createDictType(data: DictTypeVO) {
  return alovaInstance
    .Post<number>('/api/system/dict-type/create', data, { config: { dedupKey: 'dict-type-create' } })
    .send();
}

/** 修改 */
export function updateDictType(data: DictTypeVO) {
  return alovaInstance.Put<void>('/api/system/dict-type/update', data).send();
}

/** 删除 */
export function deleteDictType(id: number) {
  return alovaInstance.Delete<void>(`/api/system/dict-type/delete?id=${id}`).send();
}

/** 批量删除 */
export function deleteDictTypeList(ids: number[]) {
  return alovaInstance.Delete<void>('/api/system/dict-type/delete-list', {
    params: { ids: ids.join(',') },
  }).send();
}

/** 导出 */
export function exportDictType(params: DictTypePageParams) {
  return alovaInstance.Get<Blob>('/api/system/dict-type/export', { params, responseType: 'blob' }).send();
}
