<template>
  <div id="app" class="flex flex-col min-h-screen min-w-0 overflow-x-hidden">
    <!-- 网络请求通用 Loading：由 http 拦截驱动 appStore.globalLoading -->
    <GlobalLoading />
    <main class="flex-1 min-h-0 w-full">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import GlobalLoading from '@/components/GlobalLoading/index.vue';
import { useAppStore } from '@/store/modules/app';
import { setDayjsLocale } from '@/utils/dayjs';
import { useRouteLoading } from '@/composables/useRouteLoading';

const { locale } = useI18n();
// 尽早注册路由导航钩子，供 Layout 骨架屏使用
useRouteLoading();
const appStore = useAppStore();

// 将 appStore.locale 同步到 i18n，使 Header 切换语言、Pinia 页切换等均生效
watch(
  () => appStore.locale,
  (newLocale) => {
    locale.value = newLocale;
    setDayjsLocale(newLocale);
  },
  { immediate: true }
);
</script>
