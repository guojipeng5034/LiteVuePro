// src/store/index.ts
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

/**
 * 创建并配置 Pinia store 实例
 * 
 * 支持:
 * - 持久化插件 (localStorage/sessionStorage)
 * - TypeScript 类型推导
 * - 持久化 (pinia-plugin-persistedstate)
 */
export function setupStore() {
  const pinia = createPinia();
  
  // 注册持久化插件
  pinia.use(piniaPluginPersistedstate);
  
  return pinia;
}

export { createPinia };
export * from 'pinia';
