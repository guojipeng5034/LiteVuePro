/**
 * 使用 Nprogress 作为路由进度条
 * 在 main.ts 中通过 setupPermissionGuard(router) 挂载
 * 见 @/layout/Index.vue 中 3 层 RouterView 结构
 */
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteLocationNormalized } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { trackMatomoPageView } from '@/utils/analytics';
import { trackRouteTiming } from '@/utils/performance';
import { getAppConfig } from '@/utils/appConfig';
import { useTabNavStore } from '@/store/modules/tabNav';

NProgress.configure({ showSpinner: false });

/** 判断路由是否应加入 TabNav，shouldAddTab 逻辑在 beforeEach 中调用 addTab */
function shouldAddTabForRoute(route: RouteLocationNormalized, tabPaths: string[]): boolean {
  if (route.meta?.noTagsView === true) return false;
  const path = route.path;
  if (path === '/login' || path === '/404' || path === '/403' || path.startsWith('/redirect')) return false;
  if (tabPaths.length > 0) return tabPaths.some(p => path === p || path.startsWith(p + '/'));
  return route.matched.length >= 2 && route.matched[0]?.path === '/';
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Auth/Login.vue'),
      meta: { title: 'Login', requireAuth: false, noTagsView: true, noCache: true },
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/Errors/404.vue'),
      meta: { title: '404', requireAuth: false, hidden: true, noTagsView: true, noCache: true },
    },
    {
      path: '/403',
      name: '403',
      component: () => import('@/views/Errors/403.vue'),
      meta: { title: '403', hidden: true, noTagsView: true, noCache: true },
    },
    {
      path: '/redirect/:path(.*)',
      name: 'redirect',
      component: () => import('@/views/Redirect/Redirect.vue'),
      meta: { title: 'Redirect', hidden: true, noTagsView: true, noCache: true },
    },
    {
      path: '/',
      component: () => import('@/layout/Index.vue'),
      meta: { title: 'layout.menu.home', hidden: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/Home/Home.vue'),
          meta: { title: 'layout.menu.home', icon: 'mdi:home-outline', order: 1, affix: true },
        },
        {
          path: 'demo',
          component: () => import('@/components/RouteView.vue'),
          meta: { title: 'layout.menu.demo', icon: 'mdi:view-dashboard-outline', order: 2, menuExpandOnly: true },
          redirect: '/demo/overview',
          children: [
            {
              path: 'overview',
              name: 'demo-overview',
              component: () => import('@/views/Demo/Overview.vue'),
              meta: { title: 'demo.nav.overview', icon: 'mdi:view-dashboard', order: 1 },
            },
            {
              path: 'time',
              name: 'demo-time',
              component: () => import('@/views/Demo/Time.vue'),
              meta: { title: 'demo.nav.time', icon: 'mdi:clock-outline', order: 2,hidden:true,canTo:true},
            },
            {
              path: 'pinia',
              name: 'demo-pinia',
              component: () => import('@/views/Demo/Pinia.vue'),
              meta: { title: 'demo.nav.pinia', icon: 'mdi:database-outline', order: 3 },
            },
            {
              path: 'calendar',
              name: 'demo-calendar',
              component: () => import('@/views/Demo/Calendar.vue'),
              meta: { title: 'demo.nav.calendar', icon: 'mdi:calendar-month', order: 4 },
            },
            {
              path: 'richtext',
              name: 'demo-richtext',
              component: () => import('@/views/Demo/RichText.vue'),
              meta: { title: 'demo.nav.richtext', icon: 'mdi:format-bold', order: 5 },
            },
            {
              path: 'step-form',
              name: 'demo-step-form',
              component: () => import('@/views/Demo/StepFormDemo.vue'),
              meta: { title: 'demo.nav.stepForm', icon: 'mdi:form-select', order: 7 },
            },
            {
              path: 'form-validation',
              name: 'demo-form-validation',
              component: () => import('@/views/Demo/FormValidation.vue'),
              meta: { title: 'demo.nav.formValidation', icon: 'mdi:form-textbox', order: 6 },
            },
          ],
        },
        {
          path: 'system',
          component: () => import('@/components/RouteView.vue'),
          meta: {
            title: 'layout.menu.system',
            icon: 'ep:setting',
            order: 8,
            menuExpandOnly: true,
            permissions: ['system:menu:create', 'system:dept:create', 'system:dict:create', 'system:role:create', 'system:user:create', 'system:permission:assign-role-menu'],
          },
          redirect: '/system/menu',
          children: [
            {
              path: 'menu',
              name: 'system-menu',
              component: () => import('@/views/System/menu/index.vue'),
              meta: {
                title: 'layout.menu.menuManage',
                icon: 'ep:menu',
                order: 1,
                permissions: ['system:menu:create', 'system:menu:update', 'system:menu:delete'],
              },
            },
            {
              path: 'area',
              name: 'system-area',
              component: () => import('@/views/System/area/index.vue'),
              meta: {
                title: 'layout.menu.areaManage',
                icon: 'ep:location',
                order: 2,
                permissions: ['system:menu:create', 'system:dept:create'],
              },
            },
            {
              path: 'dept',
              name: 'system-dept',
              component: () => import('@/views/System/dept/index.vue'),
              meta: {
                title: 'layout.menu.deptManage',
                icon: 'ep:office-building',
                order: 3,
                permissions: ['system:dept:create', 'system:dept:update', 'system:dept:delete'],
              },
            },
            {
              path: 'dict',
              name: 'system-dict',
              component: () => import('@/views/System/dict/index.vue'),
              meta: {
                title: 'layout.menu.dictManage',
                icon: 'ep:collection',
                order: 4,
                permissions: ['system:dict:create', 'system:dict:update', 'system:dict:delete', 'system:dict:export'],
              },
            },
            {
              path: 'dict/data/:dictType',
              name: 'system-dict-data',
              component: () => import('@/views/System/dict/data/index.vue'),
              meta: {
                title: 'layout.menu.dictData',
                icon: 'ep:document',
                hidden: true,
                activeMenu: '/system/dict',
                permissions: ['system:dict:create', 'system:dict:update', 'system:dict:delete', 'system:dict:export'],
              },
            },
            {
              path: 'role',
              name: 'system-role',
              component: () => import('@/views/System/role/index.vue'),
              meta: {
                title: 'layout.menu.roleManage',
                icon: 'ep:user',
                order: 5,
                permissions: [
                  'system:role:create',
                  'system:role:update',
                  'system:role:delete',
                  'system:role:export',
                  'system:permission:assign-role-menu',
                  'system:permission:assign-role-data-scope',
                ],
              },
            },
            {
              path: 'user',
              name: 'system-user',
              component: () => import('@/views/System/user/index.vue'),
              meta: {
                title: 'layout.menu.userManage',
                icon: 'ep:user-filled',
                order: 6,
                permissions: ['system:user:create', 'system:user:update', 'system:user:delete'],
              },
            },
          ],
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/404',
      meta: { hidden: true },
    },
  ],
});

/** 路由进入时间（用于 afterEach 埋点） */
let routeEnterTime = 0;

router.beforeEach((to, _from, next) => {
  routeEnterTime = Date.now();
  NProgress.start();
  const tabPaths = getAppConfig()?.tabNav?.tabPaths ?? [];
  if (shouldAddTabForRoute(to, tabPaths)) {
    useTabNavStore().addTab(to);
  }
  next();
});

router.afterEach((to) => {
  NProgress.done();
  // 可在此设置 document.title（index.html 默认标题）
  trackMatomoPageView(to.fullPath, to.meta?.title ? String(to.meta.title) : undefined);
  trackRouteTiming(to.path, Date.now() - routeEnterTime);
});

export default router;
