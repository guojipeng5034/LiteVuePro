/**
 * VeeValidate + Zod 表单校验（与 Element Plus 集成）
 *
 * 推荐用于新表单：声明式 Schema、TS 类型推导；与 formRules 并存，旧表单可继续用 formRules。
 *
 * 使用方式：
 * - useForm + toTypedSchema + z：定义 Schema
 * - defineField：绑定字段，返回 [valueRef, attrs]
 * - el-form-item :error="errors.xxx"：显示校验错误
 * - el-input v-model="field" v-bind="fieldAttrs"：绑定并触发校验
 *
 * @example 见 Login.vue
 */
export { useForm, useField, FormContextKey } from 'vee-validate';
export { toTypedSchema } from '@vee-validate/zod';
export { z } from 'zod';
