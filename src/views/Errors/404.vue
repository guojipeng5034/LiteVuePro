<template>
  <div class="error-page w-full h-full min-h-[60vh] flex flex-col items-center justify-center overflow-auto p-6">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-300 dark:text-gray-600">404</h1>
      <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">{{ t('errors.404') }}</p>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-500">{{ t('errors.404Desc') }}</p>
      <el-button type="primary" class="mt-6" @click="router.push('/')">
        {{ t('errors.backHome') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
</script>
