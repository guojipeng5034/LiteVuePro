<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** 图标名（对应 src/assets/icons/svg/*.svg 的文件名，不含扩展名） */
    iconClass: string;
    /** 额外 class */
    className?: string;
  }>(),
  { className: '' }
);

const iconName = computed(() => `#icon-${props.iconClass}`);
const svgClass = computed(() =>
  props.className ? `svg-icon ${props.className}` : 'svg-icon'
);
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  vertical-align: -0.15em;
}
</style>
