/**
 * 字典覆盖层：供 dict store 在登录后注入 API 数据
 * dict.ts getDictOptions 优先读取此处
 */
import type { DictDataType } from './dict';

let overrides: Record<string, DictDataType[]> = {};

export function setDictOverrides(map: Record<string, DictDataType[]>) {
  overrides = map ?? {};
}

export function getDictOverrides(): Record<string, DictDataType[]> {
  return overrides;
}
