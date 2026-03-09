/**
 * 从路由表生成侧栏菜单树，支持多级嵌套、权限过滤与“单子节点提升”规则
 * 规则：见 docs/ARCHITECTURE.md §4.6
 */
import type { RouteRecordNormalized } from 'vue-router';
import type { useUserStore } from '@/store/modules/user';

export interface MenuItem {
  path: string;
  title: string;
  icon?: string;
  order: number;
  children?: MenuItem[];
  /** 由 meta.menuExpandOnly 决定：true=点击仅展开子菜单，false=点击直接导航 */
  expandOnly?: boolean;
}

type UserStore = ReturnType<typeof useUserStore>;

/** 是否为外链（http/https），外链 path 不参与拼接，直接使用 */
export function isUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

/**
 * 路径拼接：外链直接返回 path；否则将 segment 与 basePath 规范拼接
 */
export function pathResolve(basePath: string, path: string): string {
  if (isUrl(path)) return path;
  const baseNorm = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const segNorm = path.startsWith('/') ? path.slice(1) : path;
  const full = baseNorm === '' ? `/${segNorm || ''}` : `${baseNorm}/${segNorm}`;
  return full.replaceAll(/\/+/g, '/');
}

function hasRouteAccess(route: RouteRecordNormalized, userStore: UserStore): boolean {
  const meta = route.meta;
  const roles: string[] = Array.isArray(meta.roles) ? meta.roles : [];
  const permissions: string[] = Array.isArray(meta.permissions) ? meta.permissions : [];
  if (roles.length === 0 && permissions.length === 0) return true;
  if (roles.some(role => userStore.hasRole(role))) return true;
  if (permissions.length > 0 && userStore.hasAnyPermission(permissions)) return true;
  return false;
}

function joinPath(base: string, segment: string): string {
  return pathResolve(base, segment);
}

function routeToMenuItem(
  route: RouteRecordNormalized,
  basePath: string,
  hasChildren: boolean
): Omit<MenuItem, 'children'> & { children?: MenuItem[]; expandOnly?: boolean } {
  const path = joinPath(basePath, route.path || '');
  const meta = route.meta;
  const order = meta?.order ?? 100;
  const expandOnly = meta?.menuExpandOnly ?? hasChildren;
  return {
    path,
    title: meta?.title ?? route.name?.toString() ?? path,
    icon: meta?.icon,
    order,
    expandOnly: hasChildren ? expandOnly : undefined,
  };
}

/**
 * 单子节点与 alwaysShow 的匹配逻辑：
 * - 仅有一个“展示子”且非 alwaysShow → 渲染为单个菜单项（由 buildMenuTree 提升）
 * - 无展示子但本节点有 children（全被过滤）→ 用本节点作为单菜单项（noShowingChildren）
 */
function hasOneShowingChild(
  childMenus: MenuItem[],
  parentRoute: RouteRecordNormalized,
  parentFullPath: string
): { one: true; onlyOne: MenuItem } | { one: false } {
  if (childMenus.length === 1) return { one: true, onlyOne: childMenus[0] };
  if (childMenus.length === 0 && parentRoute.children?.length) {
    const meta = parentRoute.meta;
    const order = meta?.order ?? 100;
    const onlyOne: MenuItem = {
      path: parentFullPath,
      title: meta?.title ?? parentRoute.name?.toString() ?? parentFullPath,
      icon: meta?.icon,
      order,
      expandOnly: true,
    };
    return { one: true, onlyOne };
  }
  return { one: false };
}

function processRouteWithChildren(
  route: RouteRecordNormalized,
  basePath: string,
  fullPath: string,
  childMenus: MenuItem[]
): MenuItem | null {
  if (childMenus.length === 0) {
    const { one, onlyOne } = hasOneShowingChild([], route, fullPath);
    return one ? onlyOne : null;
  }
  const alwaysShow = route.meta.alwaysShow === true;
  const { one, onlyOne } = hasOneShowingChild(childMenus, route, fullPath);
  const shouldLift = one && !alwaysShow && !onlyOne.children?.length;
  if (shouldLift) return { ...onlyOne, children: undefined };
  const node = routeToMenuItem(route, basePath, true);
  return { ...node, children: childMenus };
}

/**
 * 将路由列表转为菜单树（递归），按权限过滤，并应用“单子节点提升”规则
 */
export function buildMenuTree(
  routes: RouteRecordNormalized[],
  userStore: UserStore,
  basePath = ''
): MenuItem[] {
  const items: MenuItem[] = [];
  const sorted = [...routes].sort((a, b) => (a.meta?.order ?? 100) - (b.meta?.order ?? 100));

  for (const route of sorted) {
    if (route.meta.hidden === true) continue;
    if (!hasRouteAccess(route, userStore)) continue;

    const fullPath = joinPath(basePath, route.path || '');
    const children = route.children?.filter(c => !c.meta?.hidden);
    const hasRealChildren = Boolean(children?.length);

    if (hasRealChildren && children) {
      const childMenus = buildMenuTree(children as RouteRecordNormalized[], userStore, fullPath);
      const node = processRouteWithChildren(route, basePath, fullPath, childMenus);
      if (node) items.push(node);
    } else {
      const node = routeToMenuItem(route, basePath, false);
      items.push({ ...node, children: undefined });
    }
  }

  return items.sort((a, b) => a.order - b.order);
}

/** API 菜单 VO 转为 MenuItem（与 api/auth AuthMenuVO 或 MenuVO 兼容） */
export type ApiMenuVO = {
  name: string;
  path?: string;
  icon?: string;
  sort?: number;
  children?: ApiMenuVO[];
};
export function apiMenuToMenuItem(vo: ApiMenuVO): MenuItem {
  const hasChildren = Boolean(vo.children?.length);
  return {
    path: vo.path ?? '',
    title: vo.name,
    icon: vo.icon,
    order: vo.sort ?? 100,
    expandOnly: hasChildren ? true : undefined,
    children: hasChildren ? vo.children!.map(c => apiMenuToMenuItem(c)) : undefined,
  };
}
