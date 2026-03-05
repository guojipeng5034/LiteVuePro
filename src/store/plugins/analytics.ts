// src/store/plugins/analytics.ts
import type { PiniaPluginContext } from 'pinia';
import { trackMatomoEvent } from '@/utils/analytics';

/**
 * Analytics 插件配置
 */
export interface AnalyticsOptions {
  /** 是否启用 */
  enabled?: boolean;
  /** 需要追踪的 store */
  include?: string[];
  /** 需要追踪的 action (格式: 'storeName.actionName' 或 '*') */
  trackActions?: string[] | '*';
  /** 自定义事件处理器 */
  customHandler?: (storeName: string, actionName: string, args: any[]) => void;
}

/**
 * Pinia Analytics 插件
 * 
 * 自动追踪 store action 调用,发送到 Matomo
 * 
 * @example
 * ```ts
 * import { createPinia } from 'pinia';
 * import { piniaAnalytics } from '@/store/plugins/analytics';
 * 
 * const pinia = createPinia();
 * pinia.use(piniaAnalytics({
 *   include: ['user', 'product'],
 *   trackActions: ['user.login', 'user.logout', 'product.purchase'],
 * }));
 * ```
 */
export function piniaAnalytics(options: AnalyticsOptions = {}) {
  const {
    enabled = import.meta.env.PROD,
    include = [],
    trackActions = [],
    customHandler,
  } = options;

  return ({ store }: PiniaPluginContext) => {
    if (!enabled) return;
    
    // 如果指定了 include,只追踪列表中的 store
    if (include.length > 0 && !include.includes(store.$id)) {
      return;
    }

    store.$onAction(({ name, args, after, onError }) => {
      const actionPath = `${store.$id}.${name}`;
      
      // 检查是否需要追踪这个 action
      const shouldTrack = 
        trackActions === '*' || 
        trackActions.includes(actionPath) ||
        trackActions.includes(`${store.$id}.*`);

      if (!shouldTrack) return;

      // 自定义处理器
      if (customHandler) {
        try {
          customHandler(store.$id, name, args);
        } catch (error) {
          console.error('[piniaAnalytics] customHandler error:', error);
        }
        return;
      }

      // 默认使用 Matomo 追踪
      after(() => {
        try {
          trackMatomoEvent(
            'Store',
            name,
            store.$id,
            args.length
          );
        } catch (error) {
          console.error('[piniaAnalytics] trackMatomoEvent error:', error);
        }
      });

      onError((error) => {
        try {
          trackMatomoEvent(
            'Store',
            `${name}_error`,
            store.$id
          );
        } catch (err) {
          console.error('[piniaAnalytics] trackMatomoEvent error:', err);
        }
      });
    });
  };
}
