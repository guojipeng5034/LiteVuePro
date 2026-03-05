/**
 * 配置 i18n，从 app.config 读取 supportedLocales
 */
import { createI18n } from 'vue-i18n';
import type { I18n } from 'vue-i18n';
import { getAppConfig } from '@/utils/appConfig';

export async function setupI18n(): Promise<I18n> {
  const config = getAppConfig();
  const supportedLocales = config.supportedLocales ?? ['zh-CN'];
  const defaultLocale = config.defaultLocale ?? supportedLocales[0];

  const messages: Record<string, Record<string, unknown>> = {};
  for (const locale of supportedLocales) {
    try {
      const mod = await import(`@/locales/${locale}.json`);
      messages[locale] = mod.default ?? {};
    } catch {
      messages[locale] = {};
    }
  }

  const i18n = createI18n({
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: defaultLocale,
    messages,
  });

  return i18n;
}
