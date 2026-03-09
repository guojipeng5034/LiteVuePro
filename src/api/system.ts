/**
 * 系统管理模块 API - 菜单等
 * 使用项目封装的 Alova 实例
 *
 * MenuVO 与框架路由/Meta 对应关系见 docs/ARCHITECTURE.md §4.6.2.1
 */
import { alovaInstance } from '@/utils/http';

export interface MenuVO {
  id: number;
  /** 菜单标题 → meta.title */
  name: string;
  /** 权限标识 → meta.permissions（单条） */
  permission?: string;
  /** 1=目录 2=菜单 3=按钮 */
  type: number;
  /** 排序 → meta.order */
  sort: number;
  parentId: number;
  /** 路由路径段 → route.path */
  path: string;
  /** Iconify 名 → meta.icon */
  icon?: string;
  /** 组件路径 → 路由 component 懒加载 */
  component?: string;
  /** 路由 name，keep-alive 用 → route.name */
  componentName?: string;
  status: number;
  /** 显示/隐藏 → meta.hidden（visible=false 即 hidden=true） */
  visible?: boolean;
  /** 是否缓存 → meta.noCache（keepAlive=false 即 noCache=true） */
  keepAlive?: boolean;
  /** → meta.alwaysShow */
  alwaysShow?: boolean;
  children?: MenuVO[];
}

export interface MenuQueryParams {
  name?: string;
  status?: number;
}

/** 菜单列表（支持查询） */
export function getMenuList(params?: MenuQueryParams) {
  return alovaInstance.Get<MenuVO[]>('/api/system/menu/list', { params }).send();
}

/** 单个菜单详情 */
export function getMenu(id: number) {
  return alovaInstance.Get<MenuVO>(`/api/system/menu/get?id=${id}`).send();
}

/** 简单菜单列表（树可选，用于上级菜单下拉） */
export function getSimpleMenusList() {
  return alovaInstance.Get<MenuVO[]>('/api/system/menu/simple-list').send();
}

/** 新增菜单 */
export function createMenu(data: MenuVO) {
  return alovaInstance
    .Post<number>('/api/system/menu/create', data, { config: { dedupKey: 'menu-create' } })
    .send();
}

/** 修改菜单 */
export function updateMenu(data: MenuVO) {
  return alovaInstance.Put<void>('/api/system/menu/update', data).send();
}

/** 删除菜单 */
export function deleteMenu(id: number) {
  return alovaInstance.Delete<void>(`/api/system/menu/delete?id=${id}`).send();
}
