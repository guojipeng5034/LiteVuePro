<template>
  <div v-if="error" class="error-boundary flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900 min-h-200px" role="alert">
    <div class="error-boundary__icon mb-4 text-6xl text-gray-400 dark:text-gray-500">
      <Icon icon="mdi:alert-circle-outline" />
    </div>
    <h3 class="error-boundary__title text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
      {{ t('errorBoundary.title') }}
    </h3>
    <p class="error-boundary__desc text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
      {{ t('errorBoundary.description') }}
    </p>
    <div class="error-boundary__actions flex gap-3">
      <el-button type="primary" @click="handleRetry">
        {{ t('errorBoundary.retry') }}
      </el-button>
      <el-button @click="handleGoHome">
        {{ t('errorBoundary.goHome') }}
      </el-button>
    </div>
    <details v-if="showDetail && errorMessage" class="mt-6 text-left w-full max-w-md">
      <summary class="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
        {{ t('errorBoundary.showDetail') }}
      </summary>
      <pre class="mt-2 p-3 text-xs overflow-auto rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 max-h-32">{{ errorMessage }}</pre>
    </details>
  </div>
  <div v-else :key="retryKey" class="error-boundary__content w-full h-full min-h-0">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { reportClientError } from '@/utils/errorReport';

defineOptions({ name: 'ErrorBoundary' });

const props = withDefaults(
  defineProps<{
    /** 是否在详情中展示错误信息（开发或排查时有用） */
    showDetail?: boolean;
  }>(),
  { showDetail: import.meta.env.DEV }
);

const { t } = useI18n();
const router = useRouter();

const error = ref<Error | null>(null);
const errorMessage = ref('');
const retryKey = ref(0);

function setError(err: Error) {
  error.value = err;
  errorMessage.value = err?.message ?? String(err);
  reportClientError(err, { source: 'ErrorBoundary' });
}

function clearError() {
  error.value = null;
  errorMessage.value = '';
  retryKey.value += 1; // 重试时重新挂载子树，避免同一错误再次触发
}

onErrorCaptured((err) => {
  setError(err instanceof Error ? err : new Error(String(err)));
  return false; // 阻止继续向上冒泡
});

// 监听路由变化时重置错误，便于用户通过导航离开后再次进入
const route = router.currentRoute;
watch(
  () => route.value.fullPath,
  () => clearError()
);

function handleRetry() {
  clearError();
}

function handleGoHome() {
  clearError();
  router.replace('/').catch(() => {});
}
</script>
