/**
 * MSW Browser Worker - 用于本地开发拦截请求
 * 在 main.ts 中根据 import.meta.env.DEV 决定是否启动
 */
import { isCommonAssetRequest } from 'msw';
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/** 开发环境下 worker.start() 的选项：放行 Vite/静态资源，仅对未匹配的 API 请求打 warning */
export const workerStartOptions = {
  onUnhandledRequest(request: Request, print: { warning: () => void }) {
    if (isCommonAssetRequest(request)) return;
    const url = new URL(request.url);
    const pathname = url.pathname;
    const search = url.search;
    // 放行 Vite 开发资源：.vue 单文件组件、type=style/script、lang.xxx、/src/ 源码
    if (
      pathname.includes('.vue') ||
      search.includes('type=style') ||
      search.includes('type=script') ||
      search.includes('lang.') ||
      pathname.startsWith('/src/') ||
      pathname.startsWith('/@')
    ) {
      return;
    }
    print.warning();
  },
};
