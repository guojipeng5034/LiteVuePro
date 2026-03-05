/**
 * 路由权限守卫
 * - 白名单路径不校验登录与权限
 * - 需登录且未登录 → 重定向登录页
 * - 需角色/权限且不满足 → 重定向无权限页
 */
import type { Router } from 'vue-router';
import { useUserStore } from '@/store/modules/user';

/** 白名单 path：无需登录即可访问 */
export const WHITE_LIST: string[] = ['/login', '/404'];

/** 未登录时重定向路径 */
export const LOGIN_PATH = '/login';

/** 无权限时重定向路径 */
export const NO_PERMISSION_PATH = '/403';

/** 未授权处理器（401 时由 HTTP 层调用，在 main.ts 中注册） */
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export function getUnauthorizedHandler(): (() => void) | null {
  return unauthorizedHandler;
}

/**
 * 安装路由权限守卫
 * 应在 app.use(router) 之后、app.mount 之前调用
 */
export function setupPermissionGuard(router: Router): void {
  router.beforeEach((to, _from, next) => {
    const userStore = useUserStore();
    const isLoggedIn = userStore.isLoggedIn;

    // 白名单直接放行
    if (WHITE_LIST.some(path => to.path === path || to.path.startsWith(path + '/'))) {
      // 已登录用户访问登录页时重定向到首页或 redirect
      if (to.path === LOGIN_PATH && isLoggedIn) {
        const redirect = (to.query.redirect as string) || '/';
        next(redirect);
        return;
      }
      next();
      return;
    }

    const requireAuth = to.meta.requireAuth !== false;
    const roles = to.meta.roles ?? [];
    const permissions = to.meta.permissions ?? [];

    // 需要登录但未登录
    if (requireAuth && !isLoggedIn) {
      next({ path: LOGIN_PATH, query: { redirect: to.fullPath } });
      return;
    }

    // 需要角色校验
    if (roles.length > 0) {
      const hasRole = roles.some(role => userStore.hasRole(role));
      if (!hasRole) {
        next({ path: NO_PERMISSION_PATH });
        return;
      }
    }

    // 需要权限校验
    if (permissions.length > 0) {
      const hasPermission = userStore.hasAnyPermission(permissions);
      if (!hasPermission) {
        next({ path: NO_PERMISSION_PATH });
        return;
      }
    }

    next();
  });
}
