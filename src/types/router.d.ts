// src/types/router.d.ts

import 'vue-router';

/**
 * 扩展 Vue Router RouteMeta，用于权限守卫、页面标题与侧栏菜单
 * 菜单与路由 meta 规则：见 docs/ARCHITECTURE.md §4.6
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** 页面标题（用于 document.title、埋点与菜单） */
    title?: string;
    /** 标题后缀（可选，用于面包屑等） */
    titleSuffix?: string;
    /** 是否必须登录才能访问，默认由全局配置决定 */
    requireAuth?: boolean;
    /** 允许访问的角色，满足其一即可 */
    roles?: string[];
    /** 允许访问的权限，满足其一即可 */
    permissions?: string[];
    /** 菜单图标（Iconify 名，如 mdi:home） */
    icon?: string;
    /** 菜单排序，数字越小越靠前 */
    order?: number;
    /** 是否在侧栏菜单中隐藏（hidden 但 canTo 为 true 时仍可被跳转，如详情页） */
    hidden?: boolean;
    /** 是否固定在标签栏（若后续做多标签） */
    affix?: boolean;
    /** 侧栏菜单：即使只有一个“展示子”，也强制显示为子菜单，不提升为单菜单项 */
    alwaysShow?: boolean;
    /** 当前路由下菜单高亮的 path（不一定是当前 path，如详情页高亮列表） */
    activeMenu?: string;
    /** 侧栏菜单：true=仅展开子菜单不导航，false/undefined=点击直接导航 */
    menuExpandOnly?: boolean;
    /** 该路由不参与 keep-alive 缓存，默认 false（即默认缓存） */
    noCache?: boolean;
    /** 不加入标签栏（如登录、redirect、404），常与 noCache 一起用 */
    noTagsView?: boolean;
    /** hidden 为 true 时仍可被跳转（如详情页）；标签栏 path 映射会包含 canTo 的路由 */
    canTo?: boolean;
    /** 是否在面包屑中显示 */
    breadcrumb?: boolean;
  }
}

export {};
