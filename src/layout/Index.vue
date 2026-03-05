<template>
  <div class="app-layout flex w-full h-full min-h-screen overflow-hidden bg-white dark:bg-gray-900">
    <!-- 侧栏：桌面端可由 sidebarOpened 开关控制显隐，移动端为遮罩层 -->
    <div
      class="app-layout__sidebar-wrap h-full shrink-0 transition-all duration-200 z-50"
      :class="[
        appStore.isMobile ? 'fixed inset-y-0 left-0' : '',
        !appStore.sidebarOpened ? 'app-layout__sidebar-wrap--closed' : '',
      ]"
    >
      <AppSidebar />
    </div>
    <transition name="mask-fade">
      <div
        v-if="appStore.isMobile && appStore.sidebarOpened"
        class="app-layout__mask fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        @click="appStore.setSidebarOpened(false)"
      />
    </transition>
    <div class="app-layout__main flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
      <AppHeader />
      <TabNav
        v-if="tabNavConfig.showTabNav !== false"
        :default-path="tabNavConfig.defaultPath ?? '/'"
        :tab-paths="tabNavConfig.tabPaths ?? []"
        class="shrink-0"
      />
      <main class="app-layout__content flex-1 min-h-0 overflow-auto w-full relative bg-white dark:bg-gray-900">
        <!-- 路由切换骨架屏：降低白屏感知，仅覆盖主内容区 -->
        <Transition name="skeleton-fade">
          <div
            v-if="isNavigating"
            class="absolute inset-0 z-10 overflow-auto bg-white dark:bg-gray-900"
          >
            <PageSkeleton />
          </div>
        </Transition>
        <ErrorBoundary>
          <router-view v-slot="{ Component, route: currentRoute }">
          <transition name="fade-transform" mode="out-in">
            <!-- 单根 div + key：避免路由切换时 Transition 与 KeepAlive 导致 DOM 不同步白屏 -->
            <div
              :key="layoutChildKey(currentRoute)"
              class="layout-router-wrap h-full min-h-0 min-w-0 w-full"
            >
              <template v-if="tabNavConfig.enablePageCache !== false">
                <!-- 用 max 缓存 Layout 层组件（Home、RouteView），不依赖 include -->
                <keep-alive :max="15">
                  <component :is="Component" />
                </keep-alive>
              </template>
              <template v-else>
                <component :is="Component" />
              </template>
            </div>
          </transition>
        </router-view>
        </ErrorBoundary>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationNormalized } from 'vue-router';
import { useAppStore } from '@/store/modules/app';
import { getAppConfig } from '@/utils/appConfig';
import ErrorBoundary from '@/components/ErrorBoundary/index.vue';
import PageSkeleton from '@/components/PageSkeleton/index.vue';
import AppSidebar from './AppSidebar/index.vue';
import AppHeader from './AppHeader/index.vue';
import TabNav from './TabNav/index.vue';
import { useRouteLoading } from '@/composables/useRouteLoading';

const appStore = useAppStore();
const { isNavigating } = useRouteLoading();
const appConfig = getAppConfig();
const tabNavConfig = appConfig?.tabNav ?? {};

/** 一级子路由 path，用于 key：/demo/* 共用一个 key 以复用 RouteView，内层再按 fullPath 切换 */
function layoutChildKey(route: RouteLocationNormalized): string {
  const firstChildPath = route.matched[1]?.path ?? '';
  return firstChildPath || '/';
}
</script>

<style lang="scss" scoped>
/* 侧边栏关闭时：桌面端收窄不占位，移动端滑出视口 */
.app-layout__sidebar-wrap--closed {
  width: 0 !important;
  min-width: 0 !important;
  overflow: hidden;
  border: none;
  transform: translateX(-100%);
}
.app-layout__sidebar-wrap:not(.app-layout__sidebar-wrap--closed) {
  transform: translateX(0);
}
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.skeleton-fade-enter-from,
.skeleton-fade-leave-to {
  opacity: 0;
}
.mask-fade-enter-active,
.mask-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}
</style>
