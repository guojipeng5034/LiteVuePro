/**
 * 系统管理 - 字典数据
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

export interface DictDataVO {
  id: number;
  dictType: string;
  label: string;
  value: string;
  sort: number;
  status: number;
  colorType?: string;
  cssClass?: string;
  remark?: string;
  createTime?: string;
}

export interface DictDataPageParams {
  pageNo: number;
  pageSize: number;
  dictType?: string;
  label?: string;
  status?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 按类型批量查询（登录后初始化用） */
export function getDictDataByTypes(types: string[]) {
  const typesStr = types?.length ? types.join(',') : '';
  return alovaInstance.Get<DictDataVO[]>('/api/system/dict-data/list-by-types', {
    params: { types: typesStr },
  }).send();
}

/** 分页查询 */
export function getDictDataPage(params: DictDataPageParams) {
  return alovaInstance.Get<PageResult<DictDataVO>>('/api/system/dict-data/page', { params }).send();
}

/** 详情 */
export function getDictData(id: number) {
  return alovaInstance.Get<DictDataVO>(`/api/system/dict-data/get?id=${id}`).send();
}

/** 新增 */
export function createDictData(data: DictDataVO) {
  return alovaInstance
    .Post<number>('/api/system/dict-data/create', data, { config: { dedupKey: 'dict-data-create' } })
    .send();
}

/** 修改 */
export function updateDictData(data: DictDataVO) {
  return alovaInstance.Put<void>('/api/system/dict-data/update', data).send();
}

/** 删除 */
export function deleteDictData(id: number) {
  return alovaInstance.Delete<void>(`/api/system/dict-data/delete?id=${id}`).send();
}

/** 批量删除 */
export function deleteDictDataList(ids: number[]) {
  return alovaInstance.Delete<void>('/api/system/dict-data/delete-list', {
    params: { ids: ids.join(',') },
  }).send();
}

/** 导出 */
export function exportDictData(params: DictDataPageParams) {
  return alovaInstance.Get<Blob>('/api/system/dict-data/export', { params, responseType: 'blob' }).send();
}
