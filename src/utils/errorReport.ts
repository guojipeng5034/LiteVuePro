/**
 * 全局异常与 Promise 上报
 * - 监听 window.onerror、window.onunhandledrejection
 * - 统一上报到 Matomo 或自定义接口，便于生产排查
 */

import { trackMatomoEvent } from '@/utils/analytics';

/** 是否启用上报（生产默认 true，开发可通过 env 关闭） */
const ENABLE_REPORT =
  import.meta.env.PROD || import.meta.env.VITE_ERROR_REPORT === 'true';

/** 过滤噪音：忽略的 error message 或 reason 片段 */
const IGNORE_PATTERNS = [
  'ResizeObserver',
  'Loading chunk',
  'ChunkLoadError',
  'Non-Error promise rejection',
  'Script error.',
  'cancelled',
  'aborted',
];

function shouldIgnore(message: string): boolean {
  const str = String(message || '').toLowerCase();
  return IGNORE_PATTERNS.some(
    (p) => str.includes(p.toLowerCase()) || str.includes('network')
  );
}

export interface ReportContext {
  source?: string;
  route?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * 上报客户端错误（供 ErrorBoundary、errorHandler 等调用）
 */
export function reportClientError(
  err: Error | unknown,
  context?: ReportContext
): void {
  if (!ENABLE_REPORT) {
    if (import.meta.env.DEV && typeof console !== 'undefined') {
      console.error('[errorReport]', context?.source ?? 'client', err);
    }
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  if (shouldIgnore(message)) return;

  const stack = err instanceof Error ? err.stack : undefined;
  const name = err instanceof Error ? err.name : 'Unknown';

  trackMatomoEvent(
    'Error',
    name,
    message,
    context?.route ?? (typeof window !== 'undefined' ? window.location.pathname : '')
  );

  if (import.meta.env.DEV && typeof console !== 'undefined') {
    console.error('[errorReport]', { message, name, stack, ...context });
  }
}

/**
 * 初始化全局错误监听（在 main.ts 中调用一次）
 */
export function initErrorReport(): void {
  if (typeof window === 'undefined') return;

  window.onerror = (message, source, lineno, colno, error) => {
    const msg = String(message ?? '');
    if (shouldIgnore(msg)) return false;
    const err = error ?? new Error(msg);
    reportClientError(err, {
      source: 'window.onerror',
      route: window.location.pathname,
      message: msg,
      filename: source ?? undefined,
      lineno,
      colno,
    });
    return false; // 不阻止默认控制台输出
  };

  window.onunhandledrejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message =
      reason instanceof Error ? reason.message : String(reason ?? '');
    if (shouldIgnore(message)) return;
    const err = reason instanceof Error ? reason : new Error(message);
    reportClientError(err, {
      source: 'unhandledrejection',
      route: window.location.pathname,
    });
    // 不 preventDefault，保留控制台 Uncaught (in promise) 输出
  };
}
