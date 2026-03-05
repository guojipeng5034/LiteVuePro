<template>
  <div class="page-root w-full h-full overflow-auto bg-white dark:bg-gray-900">
    <div class="p-6 w-full max-w-4xl mx-auto">
      <!-- 欢迎语 -->
      <header class="mb-10 text-center">
        <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {{ t('home.welcome') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-4">
          {{ t('home.subtitle') }}
        </p>
        <p class="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {{ t('home.intro') }}
        </p>
      </header>

      <!-- 框架优势 -->
      <section class="mb-10">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Icon icon="mdi:lightning-bolt-outline" class="text-amber-500 dark:text-amber-400" />
          {{ t('home.advantagesTitle') }}
        </h2>
        <ul class="space-y-3">
          <li
            v-for="item in advantageKeys"
            :key="item"
            class="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          >
            <Icon icon="mdi:check-circle-outline" class="text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
            <span>{{ t(`home.advantages.${item}`) }}</span>
          </li>
        </ul>
      </section>

      <!-- 核心能力 -->
      <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <Icon icon="mdi:application-cog-outline" class="text-blue-500 dark:text-blue-400" />
          {{ t('home.capabilitiesTitle') }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <div
            v-for="item in capabilityKeys"
            :key="item"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t(`home.capabilities.${item}`) }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'home' });

const { t } = useI18n();

const advantageKeys = ['singleApp', 'techStack', 'fastBuild', 'enterprise'] as const;
const capabilityKeys = ['layout', 'request', 'i18n', 'theme', 'system'] as const;
</script>
