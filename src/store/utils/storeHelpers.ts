// src/store/utils/storeHelpers.ts
import type { Store } from 'pinia';

/**
 * Store 重置工具
 * 
 * 用于批量重置多个 store 到初始状态
 * 
 * @example
 * ```ts
 * import { resetStores } from '@/store/utils/storeHelpers';
 * import { useUserStore, useAppStore } from '@/store/modules';
 * 
 * const userStore = useUserStore();
 * const appStore = useAppStore();
 * 
 * // 重置多个 store
 * resetStores([userStore, appStore]);
 * ```
 */
export function resetStores(stores: Store[]): void {
  stores.forEach(store => {
    if (typeof store.$reset === 'function') {
      store.$reset();
    }
  });
}

/**
 * Store 状态持久化工具
 * 
 * 手动将 store 状态保存到 localStorage
 * 
 * @example
 * ```ts
 * import { persistStore, restoreStore } from '@/store/utils/storeHelpers';
 * 
 * const userStore = useUserStore();
 * persistStore(userStore, 'backup');
 * 
 * // 稍后恢复
 * restoreStore(userStore, 'backup');
 * ```
 */
export function persistStore(store: Store, key: string): void {
  try {
    const state = JSON.stringify(store.$state);
    localStorage.setItem(`store-backup-${key}`, state);
  } catch (error) {
    console.error('[storeHelpers] persistStore error:', error);
  }
}

/**
 * Store 状态恢复工具
 */
export function restoreStore(store: Store, key: string): boolean {
  try {
    const state = localStorage.getItem(`store-backup-${key}`);
    if (!state) return false;
    
    store.$patch(JSON.parse(state));
    return true;
  } catch (error) {
    console.error('[storeHelpers] restoreStore error:', error);
    return false;
  }
}

/**
 * Store 订阅工具
 * 
 * 简化 store 订阅,自动返回取消订阅函数
 * 
 * @example
 * ```ts
 * import { subscribeStore } from '@/store/utils/storeHelpers';
 * 
 * const unsubscribe = subscribeStore(
 *   userStore,
 *   (mutation, state) => {
 *     // 处理 store 变化
 *   }
 * );
 * 
 * // 取消订阅
 * unsubscribe();
 * ```
 */
export function subscribeStore(
  store: Store,
  callback: (mutation: any, state: any) => void,
  options?: { detached?: boolean }
): () => void {
  return store.$subscribe(callback, options);
}

/**
 * Store 动作拦截工具
 * 
 * 拦截 store 的 action 调用,可用于日志、权限检查等
 * 
 * @example
 * ```ts
 * import { interceptStoreAction } from '@/store/utils/storeHelpers';
 * 
 * interceptStoreAction(
 *   userStore,
 *   (name, args, after) => {
 *     // 前置逻辑
 *     after(() => {
 *       // 后置逻辑
 *     });
 *   }
 * );
 * ```
 */
export function interceptStoreAction(
  store: Store,
  interceptor: (name: string, args: any[], after: (callback: () => void) => void) => void
): () => void {
  return store.$onAction(({ name, args, after }) => {
    interceptor(name, args, after);
  });
}

/**
 * Store 状态比较工具
 * 
 * 深度比较两个 store 状态
 */
export function compareStoreStates(state1: any, state2: any): boolean {
  try {
    return JSON.stringify(state1) === JSON.stringify(state2);
  } catch {
    return false;
  }
}

/**
 * Store 批量更新工具
 * 
 * 批量更新 store 状态,只触发一次响应式更新
 * 
 * @example
 * ```ts
 * import { batchUpdateStore } from '@/store/utils/storeHelpers';
 * 
 * batchUpdateStore(userStore, {
 *   token: 'new-token',
 *   userInfo: { ...newUserInfo }
 * });
 * ```
 */
export function batchUpdateStore(store: Store, updates: Record<string, any>): void {
  store.$patch(updates);
}

/**
 * Store 状态快照工具
 * 
 * 创建 store 状态的深拷贝快照
 */
export function snapshotStore(store: Store): any {
  try {
    return JSON.parse(JSON.stringify(store.$state));
  } catch (error) {
    console.error('[storeHelpers] snapshotStore error:', error);
    return null;
  }
}
