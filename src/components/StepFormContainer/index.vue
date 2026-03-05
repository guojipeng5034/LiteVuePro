<template>
  <div class="step-form-container">
    <!-- 步骤条 -->
    <el-steps
      :active="active"
      :finish-status="finishStatus"
      align-center
      class="step-form-container__steps"
    >
      <el-step
        v-for="(step, index) in steps"
        :key="index"
        :title="step.title"
        :description="step.description"
      />
    </el-steps>

    <!-- 动态具名插槽内容区：v-show 保留状态 -->
    <div class="step-form-container__content">
      <template v-for="(_, index) in steps" :key="index">
        <div
          v-show="active === index"
          class="step-form-container__panel w-full"
        >
          <slot :name="`step-${index}`" :step-index="index" :active="active" />
        </div>
      </template>
    </div>

    <!-- 底部按钮区 -->
    <div class="step-form-container__footer">
      <el-button
        v-if="active > 0"
        @click="goPrev"
      >
        {{ prevText }}
      </el-button>
      <el-button
        v-if="active < steps.length - 1"
        type="primary"
        :loading="nextLoading"
        @click="goNext"
      >
        {{ nextText }}
      </el-button>
      <slot name="footer-extra" :active="active" :total="steps.length" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'StepFormContainer' });

export interface StepItem {
  title: string;
  description?: string;
}

const props = withDefaults(
  defineProps<{
    /** 步骤配置 */
    steps: StepItem[];
    /** 当前步骤（受控时可与 v-model:active 配合） */
    active?: number;
    /** 点击下一步前的校验/钩子，返回 false 或 reject 则阻止跳转 */
    onBeforeNext?: (currentStep: number) => boolean | Promise<boolean | void>;
    /** 已完成步骤的展示状态 */
    finishStatus?: 'wait' | 'process' | 'finish' | 'success' | 'error';
    /** 上一步按钮文案 */
    prevText?: string;
    /** 下一步按钮文案 */
    nextText?: string;
  }>(),
  {
    active: undefined,
    finishStatus: 'success',
    prevText: '上一步',
    nextText: '下一步',
  }
);

const emit = defineEmits<{
  (e: 'update:active', value: number): void;
  (e: 'change', active: number): void;
  (e: 'prev', active: number): void;
  (e: 'next', active: number): void;
}>();

const nextLoading = ref(false);

const isControlled = computed(() => props.active !== undefined && props.active !== null);
const active = computed({
  get() {
    return isControlled.value ? props.active! : innerActive.value;
  },
  set(v: number) {
    innerActive.value = v;
    emit('update:active', v);
    emit('change', v);
  },
});

const innerActive = ref(0);

watch(
  () => props.active,
  (v) => {
    if (v !== undefined && v !== null && v !== innerActive.value) {
      innerActive.value = v;
    }
  },
  { immediate: true }
);

function goPrev() {
  if (active.value <= 0) return;
  const next = active.value - 1;
  if (!isControlled.value) innerActive.value = next;
  emit('update:active', next);
  emit('change', next);
  emit('prev', next);
}

async function goNext() {
  if (active.value >= props.steps.length - 1) return;
  if (props.onBeforeNext) {
    nextLoading.value = true;
    try {
      const result = await Promise.resolve(props.onBeforeNext(active.value));
      if (result === false) return;
    } catch {
      return;
    } finally {
      nextLoading.value = false;
    }
  }
  const next = active.value + 1;
  if (!isControlled.value) innerActive.value = next;
  emit('update:active', next);
  emit('change', next);
  emit('next', next);
}
</script>

<style lang="scss" scoped>
.step-form-container {
  width: 100%;

  &__steps {
    margin-bottom: 2rem;
    padding: 0 0.5rem;
  }

  &__content {
    min-height: 12rem;
    margin-bottom: 1.5rem;
  }

  &__panel {
    animation: step-fade-in 0.2s ease-out;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid;
    @apply border-gray-200 dark:border-gray-700;

    :deep(.el-button + .el-button) {
      margin-left: 0;
    }
  }
}

@keyframes step-fade-in {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}
</style>
