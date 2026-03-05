<template>
  <div class="demo-form-validation w-full h-full min-w-0 overflow-auto">
    <main class="demo-page__main p-6 w-full min-w-0">
      <h1 class="demo-page__title text-2xl text-gray-800 dark:text-gray-200 mb-2">
        {{ t('demo.formValidation.title') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {{ t('demo.formValidation.subtitle') }}
      </p>

      <!-- 方式一：VeeValidate + Zod -->
      <el-card class="mb-6" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.formValidation.veeTitle') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {{ t('demo.formValidation.veeDesc') }}
        </p>
        <el-form label-position="top" class="max-w-xl">
          <el-form-item :label="t('demo.formValidation.username')" :error="veeErrors.username">
            <el-input
              v-model="veeUsername"
              v-bind="veeUsernameAttrs"
              :placeholder="t('demo.formValidation.usernamePlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.email')" :error="veeErrors.email">
            <el-input
              v-model="veeEmail"
              v-bind="veeEmailAttrs"
              :placeholder="t('demo.formValidation.emailPlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.password')" :error="veeErrors.password">
            <el-input
              v-model="veePassword"
              v-bind="veePasswordAttrs"
              type="password"
              :placeholder="t('demo.formValidation.passwordPlaceholder')"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.confirmPassword')" :error="veeErrors.confirmPassword">
            <el-input
              v-model="veeConfirmPassword"
              v-bind="veeConfirmPasswordAttrs"
              type="password"
              :placeholder="t('demo.formValidation.confirmPasswordPlaceholder')"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.age')" :error="veeErrors.age">
            <el-input-number
              v-model="veeAge"
              v-bind="veeAgeAttrs"
              :min="1"
              :max="150"
              :placeholder="t('demo.formValidation.agePlaceholder')"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.remark')" :error="veeErrors.remark">
            <el-input
              v-model="veeRemark"
              v-bind="veeRemarkAttrs"
              type="textarea"
              :rows="3"
              :placeholder="t('demo.formValidation.remarkPlaceholder')"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="veeSubmitting" @click="onVeeSubmit">
              {{ t('common.save') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 方式二：formRules（Element Plus rules） -->
      <el-card shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.formValidation.rulesTitle') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {{ t('demo.formValidation.rulesDesc') }}
        </p>
        <el-form
          ref="rulesFormRef"
          :model="rulesFormData"
          :rules="rulesFormRules"
          label-position="top"
          class="max-w-xl"
        >
          <el-form-item :label="t('demo.formValidation.username')" prop="username">
            <el-input
              v-model="rulesFormData.username"
              :placeholder="t('demo.formValidation.usernamePlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.email')" prop="email">
            <el-input
              v-model="rulesFormData.email"
              :placeholder="t('demo.formValidation.emailPlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.phone')" prop="phone">
            <el-input
              v-model="rulesFormData.phone"
              :placeholder="t('demo.formValidation.phonePlaceholder')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.age')" prop="age">
            <el-input-number
              v-model="rulesFormData.age"
              :min="1"
              :max="150"
              :placeholder="t('demo.formValidation.agePlaceholder')"
              class="w-full"
            />
          </el-form-item>
          <el-form-item :label="t('demo.formValidation.remark')" prop="remark">
            <el-input
              v-model="rulesFormData.remark"
              type="textarea"
              :rows="3"
              :placeholder="t('demo.formValidation.remarkPlaceholder')"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="rulesSubmitting" @click="onRulesSubmit">
              {{ t('common.save') }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useForm, toTypedSchema, z } from '@/composables/useVeeForm';
import {
  createRequiredRule,
  createEmailRule,
  createPhoneRule,
  createLengthBetweenRule,
  createLengthMaxRule,
  createNumberMinRule,
  createNumberMaxRule,
} from '@/utils/formRules';

defineOptions({ name: 'DemoFormValidation' });

const { t } = useI18n();

// ---------- VeeValidate + Zod ----------
const veeSchema = z
  .object({
    username: z.string().min(1, t('validation.required')).min(2, t('validation.lengthMin', { min: 2 })).max(32, t('validation.lengthMax', { max: 32 })),
    email: z.string().min(1, t('validation.required')).email(t('validation.email')),
    password: z.string().min(1, t('validation.required')).min(6, t('validation.lengthMin', { min: 6 })),
    confirmPassword: z.string().min(1, t('validation.required')),
    age: z.preprocess(
      (v) => (v === null || v === '' ? undefined : v),
      z.union([
        z.number().min(1, t('validation.numberMin', { min: 1 })).max(150, t('validation.numberMax', { max: 150 })),
        z.undefined(),
      ]),
    ).refine((v) => v !== undefined, { message: t('validation.required') }),
    remark: z.string().max(200, t('validation.lengthMax', { max: 200 })).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('demo.formValidation.passwordMismatch'),
    path: ['confirmPassword'],
  });

const {
  defineField: veeDefineField,
  handleSubmit: veeHandleSubmit,
  errors: veeErrors,
  isSubmitting: veeSubmitting,
} = useForm({
  validationSchema: toTypedSchema(veeSchema),
  initialValues: { username: '', email: '', password: '', confirmPassword: '', age: undefined as number | undefined, remark: '' },
});

const [veeUsername, veeUsernameAttrs] = veeDefineField('username');
const [veeEmail, veeEmailAttrs] = veeDefineField('email');
const [veePassword, veePasswordAttrs] = veeDefineField('password');
const [veeConfirmPassword, veeConfirmPasswordAttrs] = veeDefineField('confirmPassword');
const [veeAge, veeAgeAttrs] = veeDefineField('age');
const [veeRemark, veeRemarkAttrs] = veeDefineField('remark');

const onVeeSubmit = veeHandleSubmit(onVeeSubmitSuccess);

function onVeeSubmitSuccess() {
  ElMessage.success(t('demo.formValidation.submitSuccess'));
  console.log('VeeValidate 提交:', {
    username: veeUsername.value,
    email: veeEmail.value,
    age: veeAge.value,
    remark: veeRemark.value,
  });
}

// ---------- formRules ----------
const rulesFormRef = ref<FormInstance>();
const rulesSubmitting = ref(false);
const rulesFormData = reactive({
  username: '',
  email: '',
  phone: '',
  age: undefined as number | undefined,
  remark: '',
});

const rulesFormRules: FormRules = {
  username: [
    createRequiredRule(t),
    createLengthBetweenRule(t, 2, 32),
  ],
  email: [
    createRequiredRule(t),
    createEmailRule(t),
  ],
  phone: [
    createRequiredRule(t),
    createPhoneRule(t),
  ],
  age: [
    createRequiredRule(t),
    createNumberMinRule(t, 1),
    createNumberMaxRule(t, 150),
  ],
  remark: [createLengthMaxRule(t, 200)],
};

async function onRulesSubmit() {
  if (!rulesFormRef.value) return;
  try {
    rulesSubmitting.value = true;
    await rulesFormRef.value.validate();
    ElMessage.success(t('demo.formValidation.submitSuccess'));
    console.log('formRules 提交:', { ...rulesFormData });
  } catch {
    // 校验失败，不提交
  } finally {
    rulesSubmitting.value = false;
  }
}
</script>
