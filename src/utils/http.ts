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

/** 防重复：同一 dedupKey 在有效期内复用同一请求的 Promise */
const DEDUP_TTL_MS = 500;
const inFlightDedup = new Map<string, { promise: Promise<unknown>; ts: number }>();

/** 请求配置扩展：重试、防重复、取消（用法见文档 ARCHITECTURE_OPTIMIZATION） */
interface HttpConfigExt {
  retry?: number;
  dedupKey?: string;
  _dedupPromise?: Promise<unknown>;
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

/** 从环境变量或应用配置解析 API baseURL，环境变量优先 */
function getBaseURL(): string {
  const appConfig = getAppConfig();
  // 开发环境且启用 MSW 时使用空 baseURL，请求走当前域名，便于 Service Worker 拦截
  if (import.meta.env.DEV && appConfig?.enableMsw) {
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[LiteVuePro] HTTP baseURL 使用空字符串，请求将走当前域名并由 MSW 拦截');
    }
    return '';
  }
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (typeof fromEnv === 'string' && fromEnv) return fromEnv.replace(/\/$/, '');
  const fromSite = appConfig?.api_url;
  if (typeof fromSite === 'string' && fromSite) return fromSite.replace(/\/$/, '');
  return '';
}

/** User Store 持久化 key（与 store/modules/user.ts persist.key 一致） */
function getUserStorageKey(): string {
  return 'user';
}

/** 从 User Store 持久化数据中读取 Token，与 Pinia 持久化一致 */
function getToken(): string | null {
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

/** 包装适配器：重试（每次重试重新发起请求）+ 防重复；取消由 fetch 的 signal 支持，传入 method.config.signal 即可 */
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
    const result = baseAdapter(elements, method);
    const maxRetry = ext.retry ?? (method.type === 'GET' ? 2 : 0);
    const dedupKey = ext.dedupKey;
    const doOneRequest = () => baseAdapter(elements, method).response();
    const runWithRetry = async (): Promise<Response> => {
      let lastErr: unknown;
      for (let i = 0; i <= maxRetry; i++) {
        try {
          return await doOneRequest();
        } catch (e) {
          lastErr = e;
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
      inFlightDedup.set(dedupKey, { promise: p, ts: Date.now() });
      p.finally(() => {
        setTimeout(() => inFlightDedup.delete(dedupKey), DEDUP_TTL_MS + 100);
      });
    }
    result.response = () => p;
    return result;
  };
}

export const alovaInstance = createAlova({
  baseURL: getBaseURL(),
  requestAdapter: createRequestAdapter(),
  timeout: 30_000,

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
    async onSuccess(response: Response, _method) {
      if (response.status >= 400) {
        // 401 未授权：触发登出并跳转登录（由 main 注册的 setUnauthorizedHandler 处理）
        if (response.status === 401) {
          const { getUnauthorizedHandler } = await import('@/router/permission');
          getUnauthorizedHandler()?.();
        }
        const text = await response.text();
        let message = response.statusText;
        try {
          const json = JSON.parse(text);
          message = json?.message ?? json?.msg ?? message;
        } catch {
          if (text) message = text;
        }
        throw new Error(message || `HTTP ${response.status}`);
      }
      const contentType = response.headers.get('Content-Type') ?? '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        // 可选：统一业务码判断，如 code !== 0 时抛错
        if (json && typeof json.code === 'number' && json.code !== 0 && json.code !== 200) {
          throw new Error(json.message ?? json.msg ?? 'Request failed');
        }
        return json.data === undefined ? json : json.data;
      }
      return response.text();
    },
    onError(err, method) {
      console.error('[HTTP]', method.url, err);
      throw err;
    },
  },
});

export default alovaInstance;
