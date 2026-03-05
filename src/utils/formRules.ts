/**
 * 统一表单校验规则（与 i18n validation.* 对应）
 * 使用方式：import { createRequiredRule, createLengthRule, ... } from '@/utils/formRules'
 * 在 useI18n() 的 t 下使用，如 rules: { name: [createRequiredRule(t)] }
 */
import type { FormItemRule } from 'element-plus';

type I18nT = (key: string, ...args: unknown[]) => string;

/** 必填（输入框） */
export function createRequiredRule(t: I18nT): FormItemRule {
  return { required: true, message: () => t('validation.required'), trigger: 'blur' };
}

/** 必选（下拉/选择） */
export function createRequiredSelectRule(t: I18nT): FormItemRule {
  return { required: true, message: () => t('validation.requiredSelect'), trigger: 'change' };
}

/** 最小长度 */
export function createLengthMinRule(t: I18nT, min: number): FormItemRule {
  return {
    min,
    message: () => t('validation.lengthMin', { min }),
    trigger: 'blur',
  };
}

/** 最大长度 */
export function createLengthMaxRule(t: I18nT, max: number): FormItemRule {
  return {
    max,
    message: () => t('validation.lengthMax', { max }),
    trigger: 'blur',
  };
}

/** 长度范围 */
export function createLengthBetweenRule(t: I18nT, min: number, max: number): FormItemRule {
  return {
    min,
    max,
    message: () => t('validation.lengthBetween', { min, max }),
    trigger: 'blur',
  };
}

/** 数字最小值 */
export function createNumberMinRule(t: I18nT, min: number): FormItemRule {
  return {
    type: 'number',
    min,
    message: () => t('validation.numberMin', { min }),
    trigger: 'blur',
  };
}

/** 数字最大值 */
export function createNumberMaxRule(t: I18nT, max: number): FormItemRule {
  return {
    type: 'number',
    max,
    message: () => t('validation.numberMax', { max }),
    trigger: 'blur',
  };
}

/** 邮箱 */
export function createEmailRule(t: I18nT): FormItemRule {
  return {
    type: 'email',
    message: () => t('validation.email'),
    trigger: 'blur',
  };
}

/** 手机号（简单 11 位数字） */
export function createPhoneRule(t: I18nT): FormItemRule {
  return {
    pattern: /^1\d{10}$/,
    message: () => t('validation.phone'),
    trigger: 'blur',
  };
}

/** URL */
export function createUrlRule(t: I18nT): FormItemRule {
  return {
    type: 'url',
    message: () => t('validation.url'),
    trigger: 'blur',
  };
}

/** 整数 */
export function createIntegerRule(t: I18nT): FormItemRule {
  return {
    pattern: /^-?\d+$/,
    message: () => t('validation.integer'),
    trigger: 'blur',
  };
}

/** 数字 */
export function createNumberRule(t: I18nT): FormItemRule {
  return {
    type: 'number',
    message: () => t('validation.number'),
    trigger: 'blur',
  };
}

/** 组合：必填 + 长度范围（常用于名称等） */
export function createNameLikeRules(t: I18nT, min = 1, max = 64): FormItemRule[] {
  return [
    createRequiredRule(t),
    { min, max, message: () => t('validation.lengthBetween', { min, max }), trigger: 'blur' },
  ];
}
