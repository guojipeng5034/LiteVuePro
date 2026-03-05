<template>
  <!-- 单根包裹，避免 keep-alive 切换子组件时 DOM 与 VNode 不同步导致 insertBefore 报错 -->
  <div class="route-view__wrap h-full min-h-0 w-full">
    <router-view v-slot="{ Component, route }">
      <!-- noCache 路由不经过 keep-alive，避免与异步组件同帧导致栈溢出/浏览器崩溃 -->
      <template v-if="route.meta?.noCache">
        <component v-if="Component" :is="Component" :key="routeKey(route)" />
      </template>
      <template v-else-if="enablePageCache">
        <!-- 不依赖 include：异步组件 name 可能未就绪导致 include 匹配失败、反复挂载；用 key 区分 + max 限制即可稳定缓存 -->
        <keep-alive :max="20">
          <component v-if="Component" :is="Component" :key="routeKey(route)" />
        </keep-alive>
      </template>
      <template v-else>
        <component v-if="Component" :is="Component" :key="routeKey(route)" />
      </template>
    </router-view>
  </div>
</template>

<script setup lang="ts">
/**
 * 多级路由中间层级：仅渲染嵌套 router-view。
 * 嵌套层使用 keep-alive 缓存叶子页面（key + max），不依赖 include，避免异步组件 name 未就绪导致不缓存。
 */
import { onErrorCaptured } from 'vue';
import { getAppConfig } from '@/utils/appConfig';

defineOptions({ name: 'RouteView' });

const enablePageCache = getAppConfig()?.tabNav?.enablePageCache !== false;

/** 用路由 name 作为 key，保证同一页始终同一 key 以便 keep-alive 命中；无 name 时退回 fullPath */
function routeKey(route: { name?: unknown; fullPath: string }): string {
  return route.name != null && typeof route.name === 'string' ? route.name : route.fullPath;
}

/** 捕获内层 router-view 子组件更新时的错误，避免“Unhandled error during execution of component update”向上冒泡 */
onErrorCaptured((err, _instance, info) => {
  console.error('[RouteView]', info, err);
  return false;
});
</script>
