/**
 * 可配置的更新通知模块
 * - 与 @plugin-web-update-notification/vite 配合使用（插件负责轮询与默认 UI）
 * - 支持自定义回调、埋点、与 i18n 的 locale 同步
 */
import { trackMatomoEvent } from '@/utils/analytics';
import type { WebUpdateNoticeConfig } from '@/config/webUpdateNotice';
import { getWebUpdateNoticeConfig, WEB_UPDATE_NOTICE_CATEGORY } from '@/config/webUpdateNotice';

/** 插件注入的全局对象（由 Vite 插件在运行时注入） */
declare global {
  interface Window {
    pluginWebUpdateNotice_?: {
      setLocale: (locale: string) => void;
      checkUpdate: () => void;
      dismissUpdate: () => void;
      closeNotification: () => void;
      onClickRefresh?: (version: string) => void;
      onClickDismiss?: (version: string) => void;
    };
  }
}

/** 应用 locale 与插件预设的映射（zh_CN | zh_TW | en_US） */
const APP_LOCALE_TO_PLUGIN: Record<string, string> = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  'zh_TW': 'zh_TW',
  'zh_CN': 'zh_CN',
  en: 'en_US',
  'en-US': 'en_US',
  'en_US': 'en_US',
};

/**
 * 初始化更新通知模块：注册自定义回调与埋点
 * @param i18nLocale 当前 i18n locale（如 'zh-CN'），用于同步插件语言
 * @param userConfig 覆盖默认的回调与埋点配置
 */
export function initWebUpdateNotice(
  i18nLocale?: string,
  userConfig?: Partial<WebUpdateNoticeConfig>
): void {
  const config = { ...getWebUpdateNoticeConfig(), ...userConfig };
  const api = (globalThis as Window).pluginWebUpdateNotice_;
  if (!api) return;

  if (i18nLocale) {
    const pluginLocale = APP_LOCALE_TO_PLUGIN[i18nLocale] ?? 'en_US';
    (globalThis as Window).pluginWebUpdateNotice_?.setLocale(pluginLocale);
  }

  if (config.analytics) {
    document.body.addEventListener(
      'plugin_web_update_notice',
      ((e: CustomEvent<{ version: string; options?: unknown }>) => {
        const { version } = e.detail ?? {};
        trackMatomoEvent(WEB_UPDATE_NOTICE_CATEGORY, 'shown', version);
        config.onUpdateDetected?.(e.detail);
      }) as EventListener
    );
  } else {
    document.body.addEventListener(
      'plugin_web_update_notice',
      ((e: CustomEvent<{ version: string; options?: unknown }>) => {
        config.onUpdateDetected?.(e.detail);
      }) as EventListener
    );
  }

  api.onClickRefresh = (version: string) => {
    if (config.analytics) trackMatomoEvent(WEB_UPDATE_NOTICE_CATEGORY, 'refresh', version);
    config.onRefresh?.(version);
    window.location.reload();
  };

  api.onClickDismiss = (version: string) => {
    if (config.analytics) trackMatomoEvent(WEB_UPDATE_NOTICE_CATEGORY, 'dismiss', version);
    config.onDismiss?.(version);
    (globalThis as Window).pluginWebUpdateNotice_?.dismissUpdate();
  };
}
