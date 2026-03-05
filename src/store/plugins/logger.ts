// src/store/plugins/logger.ts
import type { PiniaPluginContext } from 'pinia';

/**
 * Logger 插件配置
 */
export interface LoggerOptions {
  /** 是否启用 (默认仅在开发环境启用) */
  enabled?: boolean;
  /** 是否记录状态变化 */
  logState?: boolean;
  /** 是否记录 action 调用 */
  logActions?: boolean;
  /** 是否记录 mutation (实际是 $patch) */
  logMutations?: boolean;
  /** 排除的 store (不记录日志) */
  exclude?: string[];
  /** 日志样式 */
  collapsed?: boolean;
}

/**
 * Pinia Logger 插件
 * 
 * 开发环境下记录 store 的状态变化和 action 调用
 * 
 * @example
 * ```ts
 * import { createPinia } from 'pinia';
 * import { piniaLogger } from '@/store/plugins/logger';
 * 
 * const pinia = createPinia();
 * pinia.use(piniaLogger({
 *   logActions: true,
 *   logState: true,
 *   exclude: ['cache'], // 不记录 cache store
 * }));
 * ```
 */
export function piniaLogger(options: LoggerOptions = {}) {
  const {
    enabled = import.meta.env.DEV,
    logState = true,
    logActions = true,
    logMutations = true,
    exclude = [],
    collapsed = true,
  } = options;

  return ({ store }: PiniaPluginContext) => {
    if (!enabled) return;
    if (exclude.includes(store.$id)) return;

    // 记录 action 调用（调试输出已移除）
    if (logActions) {
      store.$onAction(({ after, onError }) => {
        after(() => {});
        onError(() => {});
      });
    }

    // 记录状态变化（调试输出已移除）
    if (logMutations || logState) {
      store.$subscribe(() => {});
    }
  };
}
