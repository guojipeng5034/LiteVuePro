/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT?: string;
  readonly VITE_OPEN?: string;
  readonly VITE_BASE_URL?: string;
  /** API 根地址，优先于 app.config.api_url */
  readonly VITE_API_BASE_URL?: string;
  /** 开发环境 API 代理目标，如 http://localhost:8080；设置后 proxy /api 到该地址 */
  readonly VITE_PROXY_TARGET?: string;
  /** Matomo 统计：站点 ID */
  readonly VITE_MATOMO_SITE_ID?: string;
  /** Matomo 统计：Tracker URL（如 https://example.com/matomo.js） */
  readonly VITE_MATOMO_URL?: string;
  /** GrowthBook：API Host（如 https://cdn.growthbook.io） */
  readonly VITE_GROWTHBOOK_API_HOST?: string;
  /** GrowthBook：Client Key */
  readonly VITE_GROWTHBOOK_CLIENT_KEY?: string;
}

declare global {
  // 保留以兼容可能的历史引用，单应用模式下不再使用
}

export {};
