<template>
  <!-- 页面 100% 宽度、不设 max-width，符合开发规范 -->
  <div class="time-demo-page w-full h-full overflow-auto p-6">
    <el-card shadow="hover" class="mb-4">
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item :label="t('demo.currentTime')">
          {{ nowDisplay }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('demo.formattedDate')">
          {{ formatDate(now) }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('demo.relativeTime')">
          {{ formatRelative(now) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'demo-time' });
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs, { formatDate, formatRelative } from '@/utils/dayjs';

const { t } = useI18n();
const now = ref(dayjs());
const nowDisplay = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));

let timer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  timer = setInterval(() => {
    now.value = dayjs();
    nowDisplay.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
  }, 1000);
});
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
@use 'styles/demo.scss' as *;
</style>
