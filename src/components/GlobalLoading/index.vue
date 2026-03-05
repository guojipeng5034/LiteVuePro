<template>
  <!-- 无 DOM：通过 ElLoading 全屏遮罩展示，本组件仅做状态监听 -->
  <span v-show="false" aria-hidden="true" />
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading';
import { useAppStore } from '@/store/modules/app';

const { t } = useI18n();
const appStore = useAppStore();
let loadingInstance: LoadingInstance | null = null;
/** 超时保护：单次 Loading 最长显示时间（如请求卡死则强制关闭） */
const LOADING_MAX_MS = 60_000;
let loadingTimer: ReturnType<typeof setTimeout> | null = null;

function closeLoading(): void {
  if (loadingTimer) {
    clearTimeout(loadingTimer);
    loadingTimer = null;
  }
  if (loadingInstance) {
    loadingInstance.close();
    loadingInstance = null;
  }
}

watch(
  () => appStore.globalLoading,
  (visible) => {
    if (visible) {
      if (!loadingInstance) {
        loadingInstance = ElLoading.service({
          lock: true,
          text: t('common.loading'),
          background: 'rgba(255, 255, 255, 0.7)',
          fullscreen: true,
        });
        loadingTimer = setTimeout(() => {
          loadingTimer = null;
          appStore.setGlobalLoading(false);
          closeLoading();
        }, LOADING_MAX_MS);
      }
    } else {
      closeLoading();
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  closeLoading();
});
</script>
