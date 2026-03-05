<template>
  <div class="fixed top-4 right-4 z-50 flex items-center gap-2">
    <Icon
      v-for="s in seasons"
      :key="s"
      :icon="SEASON_META[s].icon"
      :size="20"
      class="cursor-pointer transition-all duration-200"
      :class="s === modelValue
        ? 'text-[#0f766e] dark:text-[#2dd4bf] scale-125 drop-shadow-md'
        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 opacity-60 hover:opacity-100'"
      :title="SEASON_META[s].label"
      @click="$emit('update:modelValue', s)"
    />
  </div>
</template>

<script setup lang="ts">
import { type Season, SEASON_META } from '@/composables/useSeasonEffect';

defineProps<{ modelValue: Season }>();
defineEmits<{ 'update:modelValue': [val: Season] }>();

const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];
</script>
