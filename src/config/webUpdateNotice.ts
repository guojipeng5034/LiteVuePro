/**
 * 更新通知模块 - 运行时配置模板
 * 构建时配置见 vite.config.ts 中的 webUpdateNotice 插件选项
 */
export const WEB_UPDATE_NOTICE_CATEGORY = 'web_update_notice';

export interface WebUpdateNoticeConfig {
  /** 是否启用埋点（Matomo 等） */
  analytics?: boolean;
  /** 更新被检测到时的回调（可在此做自定义 UI / 逻辑） */
  onUpdateDetected?: (detail: { version: string; options?: unknown }) => void;
  /** 用户点击「刷新」时的回调（在默认 location.reload 之前调用） */
  onRefresh?: (version: string) => void;
  /** 用户点击「忽略」时的回调 */
  onDismiss?: (version: string) => void;
}

const defaultConfig: WebUpdateNoticeConfig = {
  analytics: true,
};

export function getWebUpdateNoticeConfig(): WebUpdateNoticeConfig {
  return { ...defaultConfig };
}
