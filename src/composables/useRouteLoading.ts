/**
 * 路由导航加载状态
 * 用于骨架屏等占位，在路由切换（betweenEach → afterEach）期间为 true
 * 需在 App.vue 或根组件调用一次以尽早注册路由钩子
 */
import { nextTick, ref } from 'vue';
import router from '@/router';

const isNavigating = ref(false);
let installed = false;

export function useRouteLoading() {
  if (!installed) {
    installed = true;
    router.beforeEach(() => {
      isNavigating.value = true;
    });
    router.afterEach(() => {
      nextTick(() => {
        isNavigating.value = false;
      });
    });
  }
  return { isNavigating };
}
