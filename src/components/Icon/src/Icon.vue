<script lang="ts" setup>
import { Icon as IconifyIcon } from '@iconify/vue';

defineOptions({ name: 'Icon' });

withDefaults(
  defineProps<{
    icon?: string;
    color?: string;
    size?: number;
    svgClass?: string;
  }>(),
  {
    size: 16,
    svgClass: '',
  }
);
</script>

<template>
  <IconifyIcon
    :icon="icon"
    :style="{ fontSize: size ? `${size}px` : undefined, height: '1em', color }"
    :class="svgClass"
    v-bind="$attrs"
  />
</template>
