// src/types/store.d.ts

import 'pinia';

/**
 * 扩展 Pinia 类型定义
 * 
 * 为 store 添加自定义属性类型支持
 */
declare module 'pinia' {
  export interface PiniaCustomProperties {
    // 可以在这里添加自定义的 store 属性
    // 例如: router: Router
  }

  export interface PiniaCustomStateProperties {
    // 可以在这里添加自定义的 state 属性
  }
}

export {};
