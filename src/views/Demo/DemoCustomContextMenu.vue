<template>
  <div
    v-show="visible"
    class="demo-custom-context-menu fixed rounded-lg border shadow-lg py-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 min-w-44 z-[9999]"
    :style="{ left: x + 'px', top: y + 'px' }"
  >
    <div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
      <template v-if="target === 'slot'">选中时段</template>
      <template v-else>
        <span class="font-medium text-gray-800 dark:text-gray-200">{{ event?.title ?? '事件' }}</span>
        <span v-if="event" class="block mt-1 text-gray-500 dark:text-gray-400">{{ slotPropsSummary }}</span>
      </template>
    </div>
    <!-- slot（事件块）右键：仅显示 Lock / Del；空白处：使用内置 items -->
    <template v-if="target === 'event'">
      <button
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-inherit bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="emit('action', slotLocked ? 'Unlock' : 'Lock')"
      >
        {{ t(slotLocked ? 'components.businessCalendar.contextMenu.unlock' : 'components.businessCalendar.contextMenu.lock') }}
      </button>
      <button
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        @click="emit('action', 'Remove')"
      >
        {{ t('components.businessCalendar.contextMenu.remove') }}
      </button>
    </template>
    <template v-else>
      <button
        v-for="item in items"
        :key="item.action"
        type="button"
        class="w-full text-left px-3 py-2 text-sm text-inherit bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="item.disabled"
        @click="emit('action', item.action)"
      >
        {{ item.label }}
      </button>
    </template>
    <button
      type="button"
      class="w-full text-left px-3 py-2 text-sm text-inherit bg-transparent border-0 border-t border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
      @click="emit('close')"
    >
      {{ t('components.businessCalendar.contextMenu.close') }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DemoCustomContextMenu' });

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ContextMenuSlotProps, ContextMenuActionType } from '@/components/BusinessCalendar/types';

const { t } = useI18n();

const props = defineProps<ContextMenuSlotProps>();

const emit = defineEmits<{
  action: [action: ContextMenuActionType];
  close: [];
}>();

/** 当前 slot 是否已锁定 */
const slotLocked = computed(() => (props.event?.extendedProps?.lockedFlag as boolean) === true);

/** slot 属性摘要（用于展示：id、时间、statusId 等） */
const slotPropsSummary = computed(() => {
  const ev = props.event;
  if (!ev) return '';
  const ext = ev.extendedProps ?? {};
  const parts: string[] = [];
  if (ev.id) parts.push(`ID: ${ev.id}`);
  if (ev.start) parts.push(ev.start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  if (ev.end) parts.push(`→ ${ev.end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`);
  if (typeof ext.statusId === 'number') parts.push(`statusId: ${ext.statusId}`);
  if (typeof ext.eventType === 'string') parts.push(`类型: ${ext.eventType}`);
  return parts.join(' · ');
});
</script>
