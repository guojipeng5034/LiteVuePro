<template>
  <div class="demo-layout flex w-full h-full overflow-hidden">
    <!-- Demo 顶级导航栏：概览 / 时间演示 / Pinia 演示 -->
    <aside class="demo-layout__nav w-48 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {{ t('demo.layoutNavTitle') }}
        </h2>
      </div>
      <nav class="flex-1 overflow-y-auto p-2">
        <RouterLink
          v-for="item in layoutNavItems"
          :key="item.path"
          :to="item.path"
          class="demo-layout__nav-link flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          :class="{ 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium': isActive(item.path) }"
        >
          <Icon v-if="item.icon" :icon="item.icon" class="text-lg shrink-0" />
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>
    </aside>

    <!-- 子 Demo 内容区：min-w-0 使 flex 子项可收缩，避免横向滚动条 -->
    <main class="demo-layout__main flex-1 min-w-0 overflow-hidden w-full">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'demo-index' });
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();

const layoutNavItems: { path: string; labelKey: string; icon?: string }[] = [
  { path: '/demo/overview', labelKey: 'demo.nav.overview', icon: 'mdi:view-dashboard-outline' },
  { path: '/demo/pinia', labelKey: 'demo.nav.pinia', icon: 'mdi:database-outline' },
  { path: '/demo/calendar', labelKey: 'demo.nav.calendar', icon: 'mdi:calendar-month' },
  { path: '/demo/form-validation', labelKey: 'demo.nav.formValidation', icon: 'mdi:form-textbox' },
];

function isActive(path: string): boolean {
  if (path === '/demo/overview') return route.path === '/demo/overview' || route.path === '/demo' || route.path === '/demo/';
  return route.path.startsWith(path);
}
</script>

<style lang="scss" scoped>
.demo-layout__nav-link.router-link-active {
  @apply bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium;
}
</style>
