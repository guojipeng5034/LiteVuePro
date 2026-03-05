/**
 * TabNav 标签页 store
 * keep-alive 通过 cachedNames 控制缓存，与 TabNav 联动?
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';
import type { TabNavItem } from '@/types/tabNav';

const STORAGE_KEY_PREFIX = 'tabnav';
const DEFAULT_HOME_PATH = '/';

function getStorageKey(): string {
  return STORAGE_KEY_PREFIX;
}

/** 将 route 转为 path/fullPath 等 TabNavItem */
function routeToTab(route: RouteLocationNormalized): TabNavItem {
  const title = (route.meta?.title as string) ?? '';
  const affix = route.meta?.affix === true;
  const noCache = route.meta?.noCache === true;
  const name = route.name as string | undefined;
  return {
    path: route.path,
    fullPath: route.fullPath,
    title: title || '未命名',
    affix,
    name,
    noCache,
  };
}

export const useTabNavStore = defineStore('tabNav', () => {
  const visitedTabs = ref<TabNavItem[]>([]);
  const activePath = ref<string>(DEFAULT_HOME_PATH);
  /** 被排除缓存的 name 列表，addTab 时移除 */
  const excludedFromCache = ref<Set<string>>(new Set());

  /** keep-alive 的 include，meta.noCache 为 true 或 excludedFromCache 中的不缓存 */
  const cachedNames = computed(() => {
    const excluded = excludedFromCache.value;
    return visitedTabs.value
      .filter(
        tab =>
          typeof tab.name === 'string' &&
          tab.name.length > 0 &&
          tab.noCache !== true &&
          !excluded.has(tab.name)
      )
      .map(tab => tab.name as string);
  });

  /**
   * 从 meta.affix 初始化固定标签
   * 在 initFromStorage 或 addTab(route) 前需先有 router.getRoutes()
   */
  function initAffixTabs(routes: any[]) {
    const affixTabs: TabNavItem[] = [];
    function walk(records: any[], parentPath = '') {
      for (const record of records) {
        const base = parentPath ? parentPath.replace(/\/$/, '') : '';
        const segmentPath = base ? `${base}/${record.path}` : `/${record.path}`;
        const fullPath = record.path ? segmentPath : parentPath || '/';
        if (record.meta?.affix === true && record.name != null) {
          const title = (record.meta?.title as string) ?? '';
          const noCache = record.meta?.noCache === true;
          affixTabs.push({
            path: record.path ?? '/',
            fullPath,
            title: title || '未命名',
            affix: true,
            name: record.name as string,
            noCache,
          });
        }
        if (record.children?.length) walk(record.children, fullPath);
      }
    }
    walk(routes);
    for (const tab of affixTabs) {
      const exists = visitedTabs.value.some(t => t.name === tab.name || t.fullPath === tab.fullPath);
      if (!exists) visitedTabs.value.unshift(tab);
    }
    if (affixTabs.length > 0) persist();
  }

  /** 从 localStorage 恢复 tabs */
  function initFromStorage() {
    try {
      const raw = localStorage.getItem(getStorageKey());
      if (!raw) return;
      const data = JSON.parse(raw) as { tabs: TabNavItem[]; activePath: string };
      if (Array.isArray(data.tabs) && data.tabs.length > 0) {
        visitedTabs.value = data.tabs;
      }
      if (typeof data.activePath === 'string' && data.activePath) {
        activePath.value = data.activePath;
      }
    } catch {
      // ignore
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        getStorageKey(),
        JSON.stringify({
          tabs: visitedTabs.value,
          activePath: activePath.value,
        })
      );
    } catch {
      // ignore
    }
  }

  /**
   * 添加标签，path 相同则更新
   * 若 title 变化会更新
   * 注意 path 为 '' 或 '/' 的根路由处理
   */
  function addTab(route: RouteLocationNormalized) {
    const name = route.name as string | undefined;
    if (name) excludedFromCache.value = new Set([...excludedFromCache.value].filter(n => n !== name));
    const path = route.path;
    const fullPath = route.fullPath;
    const existing = visitedTabs.value.find(t => {
      if (t.path === path) return true;
      // 根路由 path 为 '' 时 resolve 为 '/'
      const isRoot = path === '/' || path === '';
      const tIsRoot = t.path === '/' || t.path === '';
      if (isRoot && tIsRoot) return true;
      return t.fullPath === fullPath;
    });
    if (existing) {
      existing.fullPath = fullPath;
      activePath.value = fullPath;
      persist();
      return;
    }
    const tab = routeToTab(route);
    visitedTabs.value.push(tab);
    activePath.value = fullPath;
    persist();
  }

  /** 从缓存中排除 name，用于 delCachedView 后 redirect 时 */
  function delCachedView(name: string) {
    excludedFromCache.value = new Set([...excludedFromCache.value, name]);
  }

  /**
   * 移除标签（保留 affix），返回需跳转的 fullPath 或 null
   */
  function removeTab(fullPathOrPath: string, homePath: string = DEFAULT_HOME_PATH): string | null {
    const tab = visitedTabs.value.find(t => t.fullPath === fullPathOrPath || t.path === fullPathOrPath);
    if (!tab || tab.affix) return null;
    const index = visitedTabs.value.findIndex(t => t.fullPath === fullPathOrPath || t.path === fullPathOrPath);
    if (index === -1) return null;
    visitedTabs.value.splice(index, 1);
    const wasActive = activePath.value === fullPathOrPath
      || visitedTabs.value.find(t => t.fullPath === activePath.value)?.path === tab.path;
    let nextFullPath: string;
    if (wasActive) {
      nextFullPath = index > 0
        ? visitedTabs.value[index - 1].fullPath
        : (visitedTabs.value[0]?.fullPath ?? homePath);
    } else {
      nextFullPath = activePath.value;
    }
    activePath.value = nextFullPath;
    persist();
    return nextFullPath;
  }

  function setActive(fullPath: string) {
    activePath.value = fullPath;
    persist();
  }

  /** 关闭其他（保留 affix） */
  function removeOtherTabs(fullPath: string, homePath: string = DEFAULT_HOME_PATH): string | null {
    const keep = visitedTabs.value.filter(
      t => t.affix || t.fullPath === fullPath || t.path === fullPath
    );
    const target = visitedTabs.value.find(t => t.fullPath === fullPath || t.path === fullPath);
    if (!target) return null;
    visitedTabs.value = keep;
    activePath.value = target.fullPath;
    persist();
    return target.fullPath;
  }

  /** 关闭左侧（保留 affix） */
  function removeLeftTabs(fullPath: string): string | null {
    const index = visitedTabs.value.findIndex(t => t.fullPath === fullPath);
    if (index === -1) return null;
    const beforeCount = visitedTabs.value.length;
    visitedTabs.value = visitedTabs.value.filter((t, i) => i >= index || t.affix);
    const afterCount = visitedTabs.value.length;
    if (beforeCount !== afterCount) persist();
    return activePath.value;
  }

  /** 关闭右侧（保留 affix） */
  function removeRightTabs(fullPath: string): string | null {
    const index = visitedTabs.value.findIndex(t => t.fullPath === fullPath);
    if (index === -1) return null;
    const beforeCount = visitedTabs.value.length;
    visitedTabs.value = visitedTabs.value.filter((t, i) => i <= index || t.affix);
    const afterCount = visitedTabs.value.length;
    if (beforeCount !== afterCount) persist();
    return activePath.value;
  }

  /** 关闭全部（保留 affix） */
  function removeAllTabs(homePath: string = DEFAULT_HOME_PATH): string | null {
    const keep = visitedTabs.value.filter(t => t.affix);
    const needNavigate = !keep.some(t => t.fullPath === activePath.value);
    visitedTabs.value = keep;
    const nextFullPath = keep.length > 0 ? keep[keep.length - 1].fullPath : homePath;
    activePath.value = nextFullPath;
    persist();
    return needNavigate ? nextFullPath : null;
  }

  /** 重置为仅 affix 标签 */
  function reset() {
    const first = visitedTabs.value.find(t => t.affix);
    visitedTabs.value = first ? [first] : [];
    activePath.value = first?.fullPath ?? DEFAULT_HOME_PATH;
    persist();
  }

  return {
    visitedTabs,
    activePath,
    cachedNames,
    excludedFromCache,
    initFromStorage,
    initAffixTabs,
    addTab,
    removeTab,
    removeOtherTabs,
    removeLeftTabs,
    removeRightTabs,
    removeAllTabs,
    setActive,
    delCachedView,
    reset,
    persist,
  };
}, {
  persist: false,
});
