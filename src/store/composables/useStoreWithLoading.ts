// src/store/composables/useStoreWithLoading.ts
import { ref } from 'vue';
import { useAppStore } from '../modules/app';

/**
 * Store Action 加载状态管理 Composable
 * 
 * 为异步 store action 提供 loading 状态管理
 * 
 * @example
 * ```ts
 * // 在 store 中使用
 * import { useStoreWithLoading } from '@/store/composables/useStoreWithLoading';
 * 
 * export const useProductStore = defineStore('product', () => {
 *   const { loading, withLoading } = useStoreWithLoading();
 *   
 *   const products = ref([]);
 *   
 *   const fetchProducts = withLoading(async () => {
 *     const res = await api.getProducts();
 *     products.value = res.data;
 *   });
 *   
 *   return { products, loading, fetchProducts };
 * });
 * ```
 */
export function useStoreWithLoading(options: {
  globalLoading?: boolean; // 是否使用全局 loading
} = {}) {
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const appStore = options.globalLoading ? useAppStore() : null;

  /**
   * 包装异步函数,自动管理 loading 状态
   */
  function withLoading<T extends (...args: any[]) => Promise<any>>(
    fn: T
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    return async (...args: Parameters<T>) => {
      loading.value = true;
      error.value = null;
      
      if (appStore) {
        appStore.setGlobalLoading(true);
      }

      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err));
        throw err;
      } finally {
        loading.value = false;
        if (appStore) {
          appStore.setGlobalLoading(false);
        }
      }
    };
  }

  /**
   * 手动设置 loading 状态
   */
  function setLoading(value: boolean) {
    loading.value = value;
    if (appStore) {
      appStore.setGlobalLoading(value);
    }
  }

  /**
   * 清除错误
   */
  function clearError() {
    error.value = null;
  }

  return {
    loading,
    error,
    withLoading,
    setLoading,
    clearError,
  };
}
