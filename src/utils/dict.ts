/**
 * 数据字典工具类
 * - 优先使用登录后 API 初始化的数据（由 dict store 注入到 dictOverrides）
 * - 否则回退到 STATIC_DICT
 */
import { getDictOverrides } from './dictOverrides';

export interface DictDataType {
  dictType: string;
  label: string;
  value: string | number | boolean;
  colorType?: string;
  cssClass?: string;
}

export interface NumberDictDataType extends DictDataType {
  value: number;
}

export interface StringDictDataType extends DictDataType {
  value: string;
}

/** 静态字典：仅包含菜单/系统管理用到的类型，其余返回空数组 */
const STATIC_DICT: Record<string, DictDataType[]> = {
  common_status: [
    { dictType: 'common_status', label: '启用', value: 0, colorType: 'success', cssClass: '' },
    { dictType: 'common_status', label: '关闭', value: 1, colorType: 'danger', cssClass: '' },
  ],
  /** 用户状态：sys_user 表 1=正常 0=禁用，与 common_status 相反 */
  user_status: [
    { dictType: 'user_status', label: '启用', value: 1, colorType: 'success', cssClass: '' },
    { dictType: 'user_status', label: '禁用', value: 0, colorType: 'danger', cssClass: '' },
  ],
  system_menu_type: [
    { dictType: 'system_menu_type', label: '目录', value: 1, colorType: '', cssClass: '' },
    { dictType: 'system_menu_type', label: '菜单', value: 2, colorType: '', cssClass: '' },
    { dictType: 'system_menu_type', label: '按钮', value: 3, colorType: '', cssClass: '' },
  ],
  system_role_type: [
    { dictType: 'system_role_type', label: '内置角色', value: 1, colorType: 'danger', cssClass: '' },
    { dictType: 'system_role_type', label: '自定义角色', value: 2, colorType: 'primary', cssClass: '' },
  ],
  system_data_scope: [
    { dictType: 'system_data_scope', label: '全部数据', value: 1, colorType: '', cssClass: '' },
    { dictType: 'system_data_scope', label: '本部门及以下', value: 2, colorType: '', cssClass: '' },
    { dictType: 'system_data_scope', label: '本部门', value: 3, colorType: '', cssClass: '' },
    { dictType: 'system_data_scope', label: '仅本人', value: 4, colorType: '', cssClass: '' },
    { dictType: 'system_data_scope', label: '自定义部门', value: 5, colorType: '', cssClass: '' },
  ],
};

export function getDictOptions(dictType: string): DictDataType[] {
  const map = getDictOverrides();
  if (map[dictType]?.length) return map[dictType];
  return STATIC_DICT[dictType] ?? [];
}

export function getIntDictOptions(dictType: string): NumberDictDataType[] {
  const dictOptions = getDictOptions(dictType);
  return dictOptions.map((dict) => ({
    ...dict,
    value: Number(dict.value),
  })) as NumberDictDataType[];
}

export function getStrDictOptions(dictType: string): StringDictDataType[] {
  const dictOptions = getDictOptions(dictType);
  return dictOptions.map((dict) => ({
    ...dict,
    value: String(dict.value),
  })) as StringDictDataType[];
}

export function getBoolDictOptions(dictType: string): DictDataType[] {
  const dictOptions = getDictOptions(dictType);
  return dictOptions.map((dict) => ({
    ...dict,
    value: String(dict.value) === 'true',
  }));
}

export function getDictObj(dictType: string, value: unknown): DictDataType | undefined {
  const dictOptions = getDictOptions(dictType);
  return dictOptions.find((dict) => String(dict.value) === String(value));
}

export function getDictLabel(dictType: string, value: unknown): string {
  const obj = getDictObj(dictType, value);
  return obj?.label ?? '';
}

export const DICT_TYPE = {
  USER_TYPE: 'user_type',
  COMMON_STATUS: 'common_status',
  USER_STATUS: 'user_status',
  TERMINAL: 'terminal',
  DATE_INTERVAL: 'date_interval',
  SYSTEM_USER_SEX: 'system_user_sex',
  SYSTEM_MENU_TYPE: 'system_menu_type',
  SYSTEM_ROLE_TYPE: 'system_role_type',
  SYSTEM_DATA_SCOPE: 'system_data_scope',
  SYSTEM_NOTICE_TYPE: 'system_notice_type',
  SYSTEM_LOGIN_TYPE: 'system_login_type',
  SYSTEM_LOGIN_RESULT: 'system_login_result',
} as const;
