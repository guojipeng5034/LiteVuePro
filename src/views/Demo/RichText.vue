<template>
  <div class="demo-richtext w-full h-full min-w-0 overflow-auto">
    <main class="demo-page__main p-6 w-full min-w-0">
      <h1 class="demo-page__title text-2xl text-gray-800 dark:text-gray-200 mb-2">
        {{ t('demo.richtext.title') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {{ t('demo.richtext.subtitle') }}
      </p>

      <!-- 1. 基础用法 -->
      <el-card id="demo-richtext-basic" class="demo-page__section scroll-mt-4 mb-6" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.richtext.basicTitle') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.richtext.basicDesc') }}
        </p>
        <TinyMCEEditor v-model="content" :height="320" />
      </el-card>

      <!-- 2. 自定义高度 -->
      <el-card id="demo-richtext-height" class="demo-page__section scroll-mt-4 mb-6" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.richtext.heightTitle') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.richtext.heightDesc') }}
        </p>
        <TinyMCEEditor v-model="contentTall" :height="200" />
      </el-card>

      <!-- 3. 只读/禁用 -->
      <el-card id="demo-richtext-disabled" class="demo-page__section scroll-mt-4 mb-6" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.richtext.disabledTitle') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.richtext.disabledDesc') }}
        </p>
        <TinyMCEEditor v-model="contentReadonly" :height="180" :disabled="true" />
      </el-card>

      <!-- 4. 预览（安全渲染） -->
      <el-card id="demo-richtext-preview" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.richtext.previewTitle') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.richtext.previewDesc') }}
        </p>
        <div
          class="preview-box rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-4 min-h-[120px] text-gray-800 dark:text-gray-200 prose dark:prose-invert max-w-none"
          v-dompurify-html="content || t('demo.richtext.previewEmpty')"
        />
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DemoRichtext' })

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { TinyMCEEditor } from '@/components/TinyMCE'

const { t } = useI18n()

const content = ref(
  '<p>欢迎使用 <strong>TinyMCE</strong> 富文本编辑器。</p><p>支持<em>加粗</em>、<u>下划线</u>、<a href="#">链接</a>、列表与表格等。</p>'
)
const contentTall = ref('<p>此处为较矮的编辑器（height=200），适用于简短内容。</p>')
const contentReadonly = ref('<p>只读模式下内容不可编辑，适合展示或审批场景。</p>')
</script>

<style lang="scss" scoped>
@use 'styles/demo.scss' as *;

.preview-box :deep(a) {
  @apply text-primary underline;
}
</style>
