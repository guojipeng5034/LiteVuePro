/**
 * Demo 模块 Mock - 与 src/api/demo.ts 对应
 * 使用 RegExp 以兼容不同 baseURL（如 /api/health 或 /base/api/health）
 */
import { http, HttpResponse } from 'msw';

export const demoHandlers = [
  http.get(/\/api\/health\/?$/, () => {
    return HttpResponse.json({ ok: true, timestamp: Date.now() });
  }),

  http.get(/\/api\/user\/me\/?$/, () => {
    return HttpResponse.json({
      code: 0,
      data: { id: 1, name: 'Mock User', role: 'admin' },
    });
  }),

  http.get(/\/api\/demo\/params\/?$/, ({ request }) => {
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      query[k] = v;
    });
    return HttpResponse.json({
      code: 0,
      data: { query, message: 'QS 参数已由 Mock 接收' },
    });
  }),
];
