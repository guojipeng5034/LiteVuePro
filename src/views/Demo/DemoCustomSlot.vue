<template>
  <div class="demo-custom-slot">
    <span class="demo-custom-slot__badge">自定义</span>
    <span class="demo-custom-slot__title">{{ arg.event.title }}</span>
    <span v-if="arg.timeText" class="demo-custom-slot__time">{{ arg.timeText }}</span>
    <span v-if="arg.isPast" class="demo-custom-slot__past">已过</span>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DemoCustomSlot' });

import type { EventContentArg } from '@fullcalendar/core';

defineProps<{
  arg: EventContentArg;
}>();
</script>

<style scoped>
.demo-custom-slot {
  height: 100%;
  min-height: 22px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.demo-custom-slot__badge {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
.demo-custom-slot__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.demo-custom-slot__time {
  flex-shrink: 0;
  opacity: 0.9;
  font-size: 11px;
}
.demo-custom-slot__past {
  flex-shrink: 0;
  opacity: 0.7;
  font-size: 10px;
}
</style>
