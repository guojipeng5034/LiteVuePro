/**
 * 页面标签栏类型定义
 */

/** 单个标签页项（与路由 meta 联动） */
export interface TabNavItem {
  /** 路由 path（pathname），用于去重：相同 path 不重复添加 */
  path: string;
  /** 完整路径（含 query/hash），用于点击标签时 router.push */
  fullPath: string;
  /** 显示标题（来自 meta.title，可为 i18n key） */
  title: string;
  /** 是否固定，固定标签不可关闭 */
  affix: boolean;
  /** 路由 name，用于 keep-alive include 缓存控制（需与组件 name 一致） */
  name?: string;
  /** 该页不参与 keep-alive 缓存（来自 meta.noCache） */
  noCache?: boolean;
}
