/**
 * 企业级 HTTP 封装 - 基于 Alova
 * - baseURL 从 app.config 或环境变量动态获取
 * - 全局请求/响应拦截：Token 注入、统一错误处理、网络请求全局 Loading
 * - 使用 qs 序列化复杂 URL 参数
 * - 可选：重试（GET 默认 2 次，或 method.config.retry）、防重复提交（method.config.dedupKey）、取消（method.config.signal）
 */
import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import type { RequestElements } from 'alova';
import qs from 'qs';
import { getAppConfig } from '@/utils/appConfig';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';

/** 防重复：同一 dedupKey 在有效期内复用同一请求的 Promise。beforeRequest 先占位避免竞态。 */
const DEDUP_TTL_MS = 500;
const inFlightDedup = new Map<string, { promise: Promise<unknown>; ts: number }>();

function createDeferred<T>(): { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/** 请求配置扩展：重试、防重复、取消（用法见文档 ARCHITECTURE_OPTIMIZATION） */
interface HttpConfigExt {
  retry?: number;
  dedupKey?: string;
  _dedupPromise?: Promise<unknown>;
  _dedupDeferred?: ReturnType<typeof createDeferred>;
  signal?: AbortSignal;
}
function getConfigExt(method: { config?: Record<string, unknown> }): HttpConfigExt {
  return (method.config ?? {}) as HttpConfigExt;
}

/** 进行中请求数，用于驱动全局 Loading（多请求并发时仅首请求显示、末请求结束关闭） */
let requestCount = 0;

function syncGlobalLoading(): void {
  try {
    const appStore = useAppStore();
    appStore.setGlobalLoading(requestCount > 0);
  } catch {
    // Pinia 未挂载时忽略（如 SSR 或极早请求）
  }
}

/** 从环境变量或应用配置解析 API baseURL；VITE_API_BASE_URL 优先，可覆盖 enableMsw 走真实后端 */
function getBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv) return fromEnv.replace(/\/$/, '');
  const appConfig = getAppConfig();
  // 开发环境且启用 MSW 时使用空 baseURL，请求走当前域名，便于 Service Worker 拦截
  if (import.meta.env.DEV && appConfig?.enableMsw) {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[LiteVuePro] HTTP baseURL 使用空字符串，请求将走当前域名并由 MSW 拦截');
    }
    return '';
  }
  const fromSite = appConfig?.api_url;
  if (typeof fromSite === 'string' && fromSite) return fromSite.replace(/\/$/, '');
  return '';
}

/** User Store 持久化 key（与 store/modules/user.ts persist.key 一致） */
function getUserStorageKey(): string {
  return 'user';
}

/** 从 User Store 读取 Token，优先内存（避免 login 后 initDict 时 persist 未写入导致 401→logout） */
function getToken(): string | null {
  try {
    const t = useUserStore().token;
    if (t) return t;
  } catch {
    /* Pinia 未挂载时忽略 */
  }
  try {
    const key = getUserStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as { token?: string };
    return data?.token ?? null;
  } catch {
    return null;
  }
}

/** 刷新中锁，避免多请求同时触发 refresh */
let refreshPromise: Promise<boolean> | null = null;

/** 401 时尝试 refresh 并执行回调（重试或登出） */
async function handle401Retry(retry: () => Promise<unknown>): Promise<unknown> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { useUserStore } = await import('@/store/modules/user');
        await useUserStore().refreshAccessToken();
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  const ok = await refreshPromise;
  if (ok) return retry();
  const { getUnauthorizedHandler } = await import('@/router/permission');
  getUnauthorizedHandler()?.();
  throw new Error('登录已过期');
}

/** 复杂 URL 参数序列化（在请求发出前用 qs 替换默认序列化） */
const QS_OPTIONS: qs.IStringifyOptions = {
  arrayFormat: 'brackets',
  skipNulls: true,
  encode: true,
};

function serializeParams(method: { url: string; config: { params?: Record<string, unknown> | string } }): void {
  const { config } = method;
  const params = config.params;
  if (params == null) return;
  if (typeof params === 'string') {
    method.url = method.url.includes('?') ? `${method.url}&${params}` : `${method.url}?${params}`;
    (config as { params?: Record<string, unknown> | string }).params = undefined;
    return;
  }
  if (typeof params === 'object' && Object.keys(params).length > 0) {
    const query = qs.stringify(params, QS_OPTIONS);
    if (query) {
      const sep = method.url.includes('?') ? '&' : '?';
      method.url = `${method.url}${sep}${query}`;
    }
    (config as { params?: Record<string, unknown> }).params = {};
  }
}

const baseAdapter = adapterFetch();

/**
 * 包装适配器：重试 + 防重复。
 * 注意：alova/fetch 在调用 baseAdapter() 时即发起请求（非惰性），故必须仅在需要发送时调用一次。
 */
function createRequestAdapter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (elements: RequestElements, method: any) => {
    const ext = getConfigExt(method);
    if (ext._dedupPromise) {
      return {
        response: () => ext._dedupPromise as Promise<Response>,
        headers: async () => new Headers(),
        abort: () => {},
      };
    }
    const maxRetry = ext.retry ?? (method.type === 'GET' ? 2 : 0);
    const dedupKey = ext.dedupKey;
    const deferred = ext._dedupDeferred;
    let adapterInstance: ReturnType<typeof baseAdapter> | null = null;

    const runWithRetry = async (): Promise<Response> => {
      let lastErr: unknown;
      for (let i = 0; i <= maxRetry; i++) {
        try {
          adapterInstance = baseAdapter(elements, method);
          return await adapterInstance.response();
        } catch (e) {
          lastErr = e;
          adapterInstance = null;
          if (i < maxRetry) {
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
          } else {
            throw e;
          }
        }
      }
      throw lastErr;
    };

    const p = runWithRetry();
    if (dedupKey) {
      if (deferred) {
        p.then(deferred.resolve).catch(deferred.reject);
      }
      p.finally(() => {
        setTimeout(() => inFlightDedup.delete(dedupKey), DEDUP_TTL_MS + 100);
      });
    }

    return {
      response: () => p,
      headers: async () => {
        await p;
        return adapterInstance ? adapterInstance.headers() : Promise.resolve(new Headers());
      },
      abort: () => adapterInstance?.abort?.(),
    };
  };
}

export const alovaInstance = createAlova({
  baseURL: getBaseURL(),
  requestAdapter: createRequestAdapter(),
  timeout: 30_000,
  /** 接口默认不缓存，需缓存的接口在 method 上显式添加 cacheFor */
  cacheFor: null,

  beforeRequest(method) {
    const config = method.config as unknown as Record<string, unknown> | undefined;
    const ext = (config ?? {}) as HttpConfigExt;
    if (ext.dedupKey) {
      const entry = inFlightDedup.get(ext.dedupKey);
      if (entry && Date.now() - entry.ts < DEDUP_TTL_MS) {
        const m = method as unknown as { config: Record<string, unknown> };
        if (!m.config) m.config = {};
        m.config['_dedupPromise'] = entry.promise;
        return;
      }
      // 先占位，避免两个请求的 beforeRequest 都通过后才写 map 的竞态
      const deferred = createDeferred<Response>();
      inFlightDedup.set(ext.dedupKey, { promise: deferred.promise as Promise<unknown>, ts: Date.now() });
      const m = method as unknown as { config: Record<string, unknown> };
      if (!m.config) m.config = {};
      m.config['_dedupDeferred'] = deferred;
    }
    // 0. 网络请求全局 Loading：递增计数并同步状态
    requestCount++;
    syncGlobalLoading();

    // 1. 复杂 URL 参数用 qs 序列化
    serializeParams(method);

    // 开发环境：在控制台输出请求，便于排查（MSW fallback 模式下 Network 面板不显示请求）
    if (import.meta.env.DEV && typeof console !== 'undefined' && console.debug) {
      const url = method.url.startsWith('http') ? method.url : `${typeof location !== 'undefined' ? location.origin : ''}${method.url}`;
      console.debug('[LiteVuePro] Request:', method.type, url);
    }

    // 2. Token 注入
    const token = getToken();
    if (token) {
      method.config.headers = method.config.headers ?? {};
      (method.config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
    // 可选：统一请求头
    method.config.headers = method.config.headers ?? {};
    const headers = method.config.headers as Record<string, string>;
    if (headers['Content-Type'] === undefined || headers['Content-Type'] === '')
      headers['Content-Type'] = 'application/json;charset=UTF-8';
  },

  responded: {
    /** 无论成功、失败或取消，只在此处递减一次，避免快速连续点击导致计数错乱、Loading 不消失 */
    onComplete(_method) {
      requestCount = Math.max(0, requestCount - 1);
      syncGlobalLoading();
    },
    async onSuccess(response: Response, method: { type: string; url: string; config?: { params?: unknown; data?: unknown } }) {
      const contentType = response.headers.get('Content-Type') ?? '';
      const isJson = contentType.includes('application/json');
      const text = await response.text();
      let json: { code?: number; message?: string; msg?: string; data?: unknown } | null = null;
      if (isJson && text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = null;
        }
      }

      const is401 = response.status === 401 || (json && json.code === 401);
      // login/refresh 的 401 是业务错误（密码错误、refreshToken 无效），不触发 refresh→logout
      if (is401) {
        const url = (method.url ?? '').toString();
        if (url.includes('/api/auth/login') || url.includes('/api/auth/refresh')) {
          throw new Error(json?.message ?? json?.msg ?? '认证失败');
        }
        const retry = async () => {
          const headers: Record<string, string> = { 'Content-Type': 'application/json;charset=UTF-8' };
          const token = getToken();
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const base = getBaseURL();
          const fullUrl = method.url.startsWith('http') ? method.url : `${base}${method.url}`;
          const body = method.type !== 'GET' && method.config?.data != null ? JSON.stringify(method.config.data) : undefined;
          const res = await fetch(fullUrl, { method: method.type, headers, body });
          const resText = await res.text();
          let resJson: { code?: number; message?: string; data?: unknown } | null = null;
          if (resText) try { resJson = JSON.parse(resText); } catch { /* non-JSON */ }
          if (resJson && resJson.code !== 0 && resJson.code !== 200) throw new Error(resJson.message ?? 'Request failed');
          return resJson?.data === undefined ? resJson : resJson.data;
        };
        return handle401Retry(retry);
      }

      if (response.status >= 400) {
        const message = json?.message ?? json?.msg ?? response.statusText ?? text;
        throw new Error(message || `HTTP ${response.status}`);
      }
      if (json && typeof json.code === 'number' && json.code !== 0 && json.code !== 200) {
        throw new Error(json.message ?? json.msg ?? 'Request failed');
      }
      return json?.data === undefined ? (json ?? text) : json.data;
    },
    onError(err, method) {
      console.error('[HTTP]', method.url, err);
      throw err;
    },
  },
});

export default alovaInstance;
