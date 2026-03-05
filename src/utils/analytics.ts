/**
 * 数据埋点与实验：Matomo + GrowthBook 封装
 * 初始化参数通过 import.meta.env 获取
 */
import { GrowthBook } from '@growthbook/growthbook';

// --- Matomo ---
declare global {
  var _paq: unknown[][] | undefined;
}

function getMatomoSiteId(): string | undefined {
  return import.meta.env.VITE_MATOMO_SITE_ID;
}

function getMatomoUrl(): string | undefined {
  return import.meta.env.VITE_MATOMO_URL;
}

/**
 * 初始化 Matomo 统计
 * 需在 index.html 或此处注入 Matomo 脚本；此处仅推送配置到 _paq，由脚本消费
 */
export function initMatomo(): void {
  const siteId = getMatomoSiteId();
  const url = getMatomoUrl();
  if (!siteId || !url) return;

  const g = globalThis as typeof globalThis & { _paq?: unknown[][] };
  g._paq = g._paq ?? [];
  const u = url.replace(/\/[^/]*$/, '/');
  g._paq.push(
    ['setSiteId', siteId],
    ['setTrackerUrl', `${u}matomo.php`],
    ['enableLinkTracking']
  );

  const script = document.createElement('script');
  script.async = true;
  script.src = url.endsWith('.js') ? url : `${u}matomo.js`;
  const first = document.getElementsByTagName('script')[0];
  first?.parentNode?.insertBefore(script, first);
}

/**
 * 上报 Matomo 页面浏览（SPA 路由切换时调用）
 */
export function trackMatomoPageView(path?: string, title?: string): void {
  const g = globalThis as typeof globalThis & { _paq?: unknown[][] };
  if (g._paq === undefined) return;
  const href = (globalThis as Window & typeof globalThis).location.href;
  const entries: unknown[][] = [['setCustomUrl', path ?? href], ['trackPageView']];
  if (title) entries.splice(1, 0, ['setDocumentTitle', title]);
  g._paq.push(...entries);
}

/**
 * 上报 Matomo 自定义事件（如更新通知展示/点击刷新/忽略）
 */
export function trackMatomoEvent(
  category: string,
  action: string,
  name?: string,
  value?: string | number
): void {
  const g = globalThis as typeof globalThis & { _paq?: unknown[][] };
  if (g._paq === undefined) return;
  const args: unknown[] = ['trackEvent', category, action];
  if (name !== undefined) args.push(name);
  if (value !== undefined) args.push(value);
  g._paq.push(args as [string, string, string, string | number]);
}

// --- GrowthBook ---
let growthbookInstance: GrowthBook | null = null;

function getGrowthBookApiHost(): string {
  return import.meta.env.VITE_GROWTHBOOK_API_HOST ?? 'https://cdn.growthbook.io';
}

function getGrowthBookClientKey(): string | undefined {
  return import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY;
}

/**
 * 初始化 GrowthBook（Feature Flags / A/B）
 */
export async function initGrowthBook(attributes?: Record<string, unknown>): Promise<GrowthBook | null> {
  const clientKey = getGrowthBookClientKey();
  if (!clientKey) return null;

  const gb = new GrowthBook({
    apiHost: getGrowthBookApiHost(),
    clientKey,
    attributes: { url: (globalThis as Window & typeof globalThis).location.href, ...attributes },
  });
  await gb.init();
  growthbookInstance = gb;
  return gb;
}

/**
 * 获取 GrowthBook 实例（需先调用 initGrowthBook）
 */
export function getGrowthBook(): GrowthBook | null {
  return growthbookInstance;
}

/**
 * 统一初始化：Matomo + GrowthBook（根据 env 有则启用）
 */
export function initAnalytics(attributes?: Record<string, unknown>): Promise<GrowthBook | null> {
  initMatomo();
  return initGrowthBook(attributes);
}
