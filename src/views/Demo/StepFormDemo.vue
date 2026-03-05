<template>
  <div class="demo-step-form w-full h-full min-w-0 overflow-auto">
    <main class="demo-page__main p-6 w-full min-w-0 max-w-3xl">
      <h1 class="demo-page__title text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {{ t('demo.stepForm.title') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {{ t('demo.stepForm.subtitle') }}
      </p>

      <el-card class="demo-step-form__card" shadow="hover">
        <StepFormContainer
          v-model:active="activeStep"
          :steps="stepConfig"
          :on-before-next="onBeforeNext"
          :prev-text="t('demo.stepForm.prevText')"
          :next-text="t('demo.stepForm.nextText')"
        >
          <!-- 第一步：基本信息 -->
          <template #step-0>
            <div class="demo-step-form__panel py-2">
              <el-form
                ref="step0FormRef"
                :model="formData"
                :rules="step0Rules"
                label-position="top"
                class="demo-step-form__form"
              >
                <el-form-item :label="t('demo.stepForm.nameLabel')" prop="name">
                  <el-input
                    v-model="formData.name"
                    :placeholder="t('demo.stepForm.namePlaceholder')"
                    clearable
                  />
                </el-form-item>
                <el-form-item :label="t('demo.stepForm.mobileLabel')" prop="mobile">
                  <el-input
                    v-model="formData.mobile"
                    :placeholder="t('demo.stepForm.mobilePlaceholder')"
                    clearable
                  />
                </el-form-item>
              </el-form>
            </div>
          </template>

          <!-- 第二步：详细说明 -->
          <template #step-1>
            <div class="demo-step-form__panel py-2">
              <el-form
                ref="step1FormRef"
                :model="formData"
                :rules="step1Rules"
                label-position="top"
                class="demo-step-form__form"
              >
                <el-form-item :label="t('demo.stepForm.remarkLabel')" prop="remark">
                  <el-input
                    v-model="formData.remark"
                    type="textarea"
                    :rows="4"
                    :placeholder="t('demo.stepForm.remarkPlaceholder')"
                  />
                </el-form-item>
              </el-form>
            </div>
          </template>

          <!-- 第三步：确认 -->
          <template #step-2>
            <div class="demo-step-form__panel py-2">
              <el-descriptions :column="1" border size="default" class="demo-step-form__confirm">
                <el-descriptions-item :label="t('demo.stepForm.nameLabel')">
                  {{ formData.name || '—' }}
                </el-descriptions-item>
                <el-descriptions-item :label="t('demo.stepForm.mobileLabel')">
                  {{ formData.mobile || '—' }}
                </el-descriptions-item>
                <el-descriptions-item :label="t('demo.stepForm.remarkLabel')">
                  {{ formData.remark || '—' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>

          <template #footer-extra="{ active: current, total }">
            <el-button
              v-if="current === total - 1"
              type="primary"
              @click="handleSubmit"
            >
              {{ t('demo.stepForm.submit') }}
            </el-button>
          </template>
        </StepFormContainer>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'DemoStepForm' });

const { t } = useI18n();
const message = useMessage();

const activeStep = ref(0);

const stepConfig = computed(() => [
  { title: t('demo.stepForm.step1Title'), description: t('demo.stepForm.step1Desc') },
  { title: t('demo.stepForm.step2Title'), description: t('demo.stepForm.step2Desc') },
  { title: t('demo.stepForm.step3Title'), description: t('demo.stepForm.step3Desc') },
]);

const formData = ref({
  name: '',
  mobile: '',
  remark: '',
});

const step0FormRef = ref<FormInstance>();
const step1FormRef = ref<FormInstance>();

const step0Rules: FormRules = {
  name: [{ required: true, message: () => t('demo.stepForm.namePlaceholder'), trigger: 'blur' }],
  mobile: [
    { required: true, message: () => t('demo.stepForm.mobilePlaceholder'), trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: () => t('validation.phone'), trigger: 'blur' },
  ],
};

const step1Rules: FormRules = {
  remark: [{ required: true, message: () => t('demo.stepForm.remarkPlaceholder'), trigger: 'blur' }],
};

/** 下一步前校验：根据当前步骤触发表单校验，不通过则阻止跳转 */
const onBeforeNext = async (currentStep: number): Promise<boolean | void> => {
  if (currentStep === 0 && step0FormRef.value) {
    try {
      await step0FormRef.value.validate();
      return true;
    } catch {
      return false;
    }
  }
  if (currentStep === 1 && step1FormRef.value) {
    try {
      await step1FormRef.value.validate();
      return true;
    } catch {
      return false;
    }
  }
  return true;
};

function handleSubmit() {
  message.success(t('demo.stepForm.submitSuccess'));
  console.log('formData', formData.value);
}
</script>

<style lang="scss" scoped>
.demo-step-form__card {
  :deep(.el-card__body) {
    padding: 1.5rem 1.75rem;
  }
}

.demo-step-form__panel {
  min-height: 10rem;
}

.demo-step-form__form {
  max-width: 28rem;
}

.demo-step-form__confirm {
  max-width: 28rem;
}
</style>
