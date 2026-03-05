/**
 * 应用配置工具 - 单应用模式
 */
import appConfig from '@/app.config';
import type { AppConfig } from '@/app.config';

let cached: AppConfig | null = null;

export function getAppConfig(): AppConfig {
  if (!cached) {
    if (!appConfig || typeof appConfig !== 'object') {
      throw new Error('应用配置文件无效');
    }
    cached = appConfig;
  }
  return cached;
}
