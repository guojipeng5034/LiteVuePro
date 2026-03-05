// src/store/composables/useStoreWithPagination.ts
import { ref, computed } from 'vue';

/**
 * 分页参数接口
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * 分页结果接口
 */
export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore?: boolean;
}

/**
 * Store 分页管理 Composable
 * 
 * 为 store 提供分页状态管理和操作方法
 * 
 * @example
 * ```ts
 * // 在 store 中使用
 * import { useStoreWithPagination } from '@/store/composables/useStoreWithPagination';
 * 
 * export const useProductStore = defineStore('product', () => {
 *   const products = ref<Product[]>([]);
 *   
 *   const pagination = useStoreWithPagination<Product>({
 *     pageSize: 20,
 *     fetchFn: async (page, pageSize) => {
 *       const res = await api.getProducts({ page, pageSize });
 *       products.value = res.list;
 *       return res;
 *     },
 *   });
 *   
 *   return { products, ...pagination };
 * });
 * ```
 */
export function useStoreWithPagination<T>(options: {
  pageSize?: number;
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>;
}) {
  const { pageSize = 20, fetchFn } = options;

  // ===== State =====
  const currentPage = ref(1);
  const currentPageSize = ref(pageSize);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // ===== Getters =====
  const totalPages = computed(() => Math.ceil(total.value / currentPageSize.value));
  const hasMore = computed(() => currentPage.value < totalPages.value);
  const hasPrev = computed(() => currentPage.value > 1);
  const isEmpty = computed(() => total.value === 0);

  // ===== Actions =====

  /**
   * 获取数据
   */
  async function fetch() {
    loading.value = true;
    error.value = null;

    try {
      const result = await fetchFn(currentPage.value, currentPageSize.value);
      total.value = result.total;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 跳转到指定页
   */
  async function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) {
      console.warn(`[useStoreWithPagination] Invalid page: ${page}`);
      return;
    }
    currentPage.value = page;
    return await fetch();
  }

  /**
   * 下一页
   */
  async function nextPage() {
    if (!hasMore.value) return;
    return await goToPage(currentPage.value + 1);
  }

  /**
   * 上一页
   */
  async function prevPage() {
    if (!hasPrev.value) return;
    return await goToPage(currentPage.value - 1);
  }

  /**
   * 刷新当前页
   */
  async function refresh() {
    return await fetch();
  }

  /**
   * 重置到第一页
   */
  async function reset() {
    currentPage.value = 1;
    return await fetch();
  }

  /**
   * 修改每页大小
   */
  async function changePageSize(size: number) {
    currentPageSize.value = size;
    currentPage.value = 1; // 重置到第一页
    return await fetch();
  }

  return {
    // state
    currentPage,
    currentPageSize,
    total,
    loading,
    error,
    // getters
    totalPages,
    hasMore,
    hasPrev,
    isEmpty,
    // actions
    fetch,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    reset,
    changePageSize,
  };
}
