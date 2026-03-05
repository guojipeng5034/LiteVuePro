// src/store/modules/cache.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  key: string;
  value: T;
  expireAt?: number; // 过期时间戳 (毫秒)
  createdAt: number;
  updatedAt: number;
}

/**
 * 缓存配置
 */
export interface CacheOptions {
  ttl?: number; // 过期时间 (毫秒)
  persist?: boolean; // 是否持久化
}

/**
 * 应用缓存管理 Store
 * 
 * 功能:
 * - 内存缓存 (快速访问)
 * - 持久化缓存 (localStorage/sessionStorage)
 * - TTL 过期机制
 * - 持久化 key 前缀 cache-
 * - 类型安全
 * 
 * @example
 * ```ts
 * const cacheStore = useCacheStore();
 * 
 * // 设置缓存 (30分钟 TTL)
 * cacheStore.set('userList', users, { ttl: 30 * 60 * 1000 });
 * 
 * // 获取缓存
 * const users = cacheStore.get<User[]>('userList');
 * 
 * // 设置持久化缓存
 * cacheStore.set('settings', settings, { persist: true });
 * ```
 */
export const useCacheStore = defineStore('cache', () => {
  // ===== State =====
  const memoryCache = ref<Map<string, CacheItem>>(new Map());
  const persistedKeys = ref<Set<string>>(new Set());

  // ===== Private Methods =====

  /**
   * 获取持久化存储的 key
   */
  function getStorageKey(key: string): string {
    return `cache-${key}`;
  }

  /**
   * 从 localStorage 加载持久化缓存
   */
  function loadFromStorage(key: string): CacheItem | null {
    try {
      const storageKey = getStorageKey(key);
      const json = localStorage.getItem(storageKey);
      if (!json) return null;

      const item: CacheItem = JSON.parse(json);
      
      // 检查是否过期
      if (item.expireAt && Date.now() > item.expireAt) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return item;
    } catch (error) {
      console.error('[useCacheStore] loadFromStorage error:', error);
      return null;
    }
  }

  /**
   * 保存到 localStorage
   */
  function saveToStorage(key: string, item: CacheItem): void {
    try {
      const storageKey = getStorageKey(key);
      const json = JSON.stringify(item);
      localStorage.setItem(storageKey, json);
      persistedKeys.value.add(key);
    } catch (error) {
      console.error('[useCacheStore] saveToStorage error:', error);
    }
  }

  /**
   * 从 localStorage 删除
   */
  function removeFromStorage(key: string): void {
    try {
      const storageKey = getStorageKey(key);
      localStorage.removeItem(storageKey);
      persistedKeys.value.delete(key);
    } catch (error) {
      console.error('[useCacheStore] removeFromStorage error:', error);
    }
  }

  // ===== Actions =====

  /**
   * 设置缓存
   */
  function set<T = any>(key: string, value: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      key,
      value,
      createdAt: now,
      updatedAt: now,
    };

    // 设置过期时间
    if (options.ttl) {
      item.expireAt = now + options.ttl;
    }

    // 存入内存
    memoryCache.value.set(key, item);

    // 持久化
    if (options.persist) {
      saveToStorage(key, item);
    }
  }

  /**
   * 获取缓存
   */
  function get<T = any>(key: string): T | null {
    // 1. 先从内存获取
    let item = memoryCache.value.get(key);

    // 2. 如果内存没有,尝试从 localStorage 加载
    if (!item && persistedKeys.value.has(key)) {
      item = loadFromStorage(key);
      if (item) {
        memoryCache.value.set(key, item);
      }
    }

    // 3. 检查是否存在
    if (!item) return null;

    // 4. 检查是否过期
    if (item.expireAt && Date.now() > item.expireAt) {
      remove(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * 判断缓存是否存在且未过期
   */
  function has(key: string): boolean {
    return get(key) !== null;
  }

  /**
   * 删除缓存
   */
  function remove(key: string): void {
    memoryCache.value.delete(key);
    removeFromStorage(key);
  }

  /**
   * 清空所有缓存
   */
  function clear(): void {
    // 清空内存缓存
    memoryCache.value.clear();

    // 清空持久化缓存
    persistedKeys.value.forEach(key => {
      removeFromStorage(key);
    });
    persistedKeys.value.clear();
  }

  /**
   * 清理过期缓存
   */
  function cleanExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    // 检查内存缓存
    memoryCache.value.forEach((item, key) => {
      if (item.expireAt && now > item.expireAt) {
        expiredKeys.push(key);
      }
    });

    // 删除过期缓存
    expiredKeys.forEach(key => remove(key));
  }

  /**
   * 获取缓存统计信息
   */
  function getStats() {
    const now = Date.now();
    let total = 0;
    let expired = 0;
    let persistent = 0;

    memoryCache.value.forEach(item => {
      total++;
      if (item.expireAt && now > item.expireAt) {
        expired++;
      }
    });

    persistent = persistedKeys.value.size;

    return {
      total,
      expired,
      persistent,
      memory: total - persistent,
    };
  }

  /**
   * 初始化 - 加载持久化缓存列表
   */
  function init() {
    // 扫描 localStorage，找出 cache- 前缀的缓存 key
    const prefix = `cache-`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const cacheKey = key.substring(prefix.length);
        persistedKeys.value.add(cacheKey);
      }
    }

    // 清理过期缓存
    cleanExpired();
  }

  // 初始化
  init();

  return {
    // state
    memoryCache,
    persistedKeys,
    // actions
    set,
    get,
    has,
    remove,
    clear,
    cleanExpired,
    getStats,
  };
});
