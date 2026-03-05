<template>
  <el-tag v-if="label !== ''" :type="tagType" :effect="effect">
    {{ label }}
  </el-tag>
  <span v-else class="text-gray-400 dark:text-gray-500">—</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getDictObj } from '@/utils/dict';

const props = withDefaults(
  defineProps<{
    /** 字典类型（如 DICT_TYPE.COMMON_STATUS） */
    type: string;
    /** 字典值 */
    value?: string | number | boolean;
    /** 是否浅色 effect */
    effect?: 'dark' | 'light' | 'plain';
  }>(),
  { effect: 'light' }
);

const label = computed(() => {
  const obj = getDictObj(props.type, props.value);
  return obj?.label ?? '';
});

const tagType = computed(() => {
  const obj = getDictObj(props.type, props.value);
  const t = (obj?.colorType ?? 'info') as string;
  if (['success', 'warning', 'danger', 'info', 'primary'].includes(t)) return t;
  return 'info';
});
</script>
