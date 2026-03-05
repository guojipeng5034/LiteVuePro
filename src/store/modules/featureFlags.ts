// src/store/modules/featureFlags.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAppConfig } from '@/utils/appConfig';
import { getGrowthBook } from '@/utils/analytics';

/**
 * Feature Flag 配置接口
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: any;
  source: 'config' | 'growthbook' | 'override';
}

/**
 * Feature Flags 状态管理 Store
 * 
 * 功能:
 * - 从应用配置加载 feature flags
 * - 与 GrowthBook 集成进行 A/B 测试
 * - 支持运行时覆盖 (开发/测试用)
 * - 提供便捷的判断方法
 * 
 * @example
 * ```ts
 * const featureFlagsStore = useFeatureFlagsStore();
 * await featureFlagsStore.init();
 * 
 * if (featureFlagsStore.isEnabled('newUI')) {
 *   // 显示新 UI
 * }
 * 
 * const variant = featureFlagsStore.getFeatureValue('buttonColor', 'blue');
 * ```
 */
export const useFeatureFlagsStore = defineStore('featureFlags', () => {
  // ===== State =====
  const flags = ref<Map<string, FeatureFlag>>(new Map());
  const initialized = ref<boolean>(false);
  const overrides = ref<Map<string, any>>(new Map());

  // ===== Getters =====
  const allFlags = computed(() => Array.from(flags.value.values()));
  const enabledFlags = computed(() => 
    allFlags.value.filter(f => f.enabled)
  );

  // ===== Actions =====

  /**
   * 初始化 Feature Flags
   */
  async function init() {
    if (initialized.value) return;

    // 1. 加载应用配置的 feature flags
    const appConfig = getAppConfig();
    if (appConfig.feature_flags) {
      Object.entries(appConfig.feature_flags).forEach(([key, value]) => {
        flags.value.set(key, {
          key,
          enabled: Boolean(value),
          value,
          source: 'config',
        });
      });
    }

    // 2. 从 GrowthBook 加载 (如果已初始化)
    try {
      const gb = getGrowthBook();
      if (gb) {
        // 等待 GrowthBook 就绪
        await gb.loadFeatures({ timeout: 3000 });
        
        // 遍历所有 GrowthBook features
        const features = gb.getFeatures();
        Object.entries(features).forEach(([key, feature]) => {
          const value = gb.getFeatureValue(key, null);
          flags.value.set(key, {
            key,
            enabled: value !== null && value !== false,
            value,
            source: 'growthbook',
          });
        });
      }
    } catch (error) {
      console.warn('[useFeatureFlagsStore] Failed to load GrowthBook features:', error);
    }

    // 3. 应用运行时覆盖
    overrides.value.forEach((value, key) => {
      flags.value.set(key, {
        key,
        enabled: Boolean(value),
        value,
        source: 'override',
      });
    });

    initialized.value = true;
  }

  /**
   * 判断 feature 是否启用
   */
  function isEnabled(key: string): boolean {
    // 优先检查覆盖
    if (overrides.value.has(key)) {
      return Boolean(overrides.value.get(key));
    }

    // 检查 GrowthBook
    const gb = getGrowthBook();
    if (gb) {
      const value = gb.getFeatureValue(key, null);
      if (value !== null) {
        return value !== false;
      }
    }

    // 检查本地 flags
    const flag = flags.value.get(key);
    return flag?.enabled ?? false;
  }

  /**
   * 获取 feature 的值
   */
  function getFeatureValue<T = any>(key: string, defaultValue?: T): T {
    // 优先检查覆盖
    if (overrides.value.has(key)) {
      return overrides.value.get(key) as T;
    }

    // 检查 GrowthBook
    const gb = getGrowthBook();
    if (gb) {
      const value = gb.getFeatureValue(key, null);
      if (value !== null) {
        return value as T;
      }
    }

    // 检查本地 flags
    const flag = flags.value.get(key);
    if (flag) {
      return flag.value as T;
    }

    return defaultValue as T;
  }

  /**
   * 获取 feature 详情
   */
  function getFeature(key: string): FeatureFlag | undefined {
    return flags.value.get(key);
  }

  /**
   * 设置运行时覆盖 (仅用于开发/测试)
   */
  function setOverride(key: string, value: any) {
    if (import.meta.env.PROD) {
      console.warn('[useFeatureFlagsStore] setOverride should not be used in production');
      return;
    }

    overrides.value.set(key, value);
    flags.value.set(key, {
      key,
      enabled: Boolean(value),
      value,
      source: 'override',
    });
  }

  /**
   * 清除运行时覆盖
   */
  function clearOverride(key: string) {
    overrides.value.delete(key);
    
    // 重新加载该 flag
    const appConfig = getAppConfig();
    const configValue = appConfig.feature_flags?.[key];
    
    if (configValue !== undefined) {
      flags.value.set(key, {
        key,
        enabled: Boolean(configValue),
        value: configValue,
        source: 'config',
      });
    } else {
      flags.value.delete(key);
    }
  }

  /**
   * 清除所有覆盖
   */
  function clearAllOverrides() {
    overrides.value.clear();
    init(); // 重新初始化
  }

  /**
   * 刷新 feature flags (从 GrowthBook)
   */
  async function refresh() {
    const gb = getGrowthBook();
    if (gb) {
      await gb.refreshFeatures();
      await init();
    }
  }

  return {
    // state
    flags,
    initialized,
    overrides,
    // getters
    allFlags,
    enabledFlags,
    // actions
    init,
    isEnabled,
    getFeatureValue,
    getFeature,
    setOverride,
    clearOverride,
    clearAllOverrides,
    refresh,
  };
});
