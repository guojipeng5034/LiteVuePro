/**
 * 标签栏对外 API：刷新当前页、关闭标签等（与 tabNav store 配合）
 */
import { useRouter, useRoute } from 'vue-router';
import { useTabNavStore } from '@/store/modules/tabNav';
import type { RouteLocationNormalized } from 'vue-router';

/**
 * 刷新当前页：先从 keep-alive 缓存中移除当前 name，再跳转到 /redirect/xxx，Redirect 页会立刻 replace 回真实 path，实现无感刷新
 */
export function useTagsView() {
  const router = useRouter();
  const route = useRoute();
  const tabNavStore = useTabNavStore();

  function refreshPage(view?: RouteLocationNormalized) {
    const target = view ?? route;
    const name = target.name as string | undefined;
    if (!name) return;
    tabNavStore.delCachedView(name);
    const path = target.path;
    const query = target.query;
    const pathWithSlash = path.startsWith('/') ? path : `/${path}`;
    const redirectPath = `/redirect${pathWithSlash}`;
    router.replace({ path: redirectPath, query }).catch(() => {});
  }

  return {
    refreshPage,
  };
}
