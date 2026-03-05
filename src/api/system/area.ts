/**
 * 系统管理 - 地区/IP
 * 使用项目封装的 Alova 实例
 */
import { alovaInstance } from '@/utils/http';

export interface AreaVO {
  id: number;
  name: string;
  children?: AreaVO[];
}

/** 获取地区树 */
export function getAreaTree() {
  return alovaInstance.Get<AreaVO[]>('/api/system/area/tree').send();
}

/** 根据 IP 查询地区 */
export function getAreaByIp(ip: string) {
  return alovaInstance
    .Get<string>('/api/system/area/get-by-ip', { params: { ip } })
    .send();
}
