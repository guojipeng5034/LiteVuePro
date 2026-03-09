/**
 * 字典 Store - 登录后从 API 初始化，供 dict 工具读取
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DictDataType } from '@/utils/dict';
import { DICT_TYPE } from '@/utils/dict';
import { setDictOverrides } from '@/utils/dictOverrides';
import { getDictDataByTypes } from '@/api/system/dict/dict.data';

/** 初始化用字典类型白名单 */
const INIT_DICT_TYPES = [
  DICT_TYPE.COMMON_STATUS,
  DICT_TYPE.SYSTEM_MENU_TYPE,
  DICT_TYPE.SYSTEM_ROLE_TYPE,
  DICT_TYPE.SYSTEM_DATA_SCOPE,
  DICT_TYPE.SYSTEM_USER_SEX,
] as const;

export const useDictStore = defineStore('dict', () => {
  const dictMap = ref<Record<string, DictDataType[]>>({});

  async function initDict() {
    try {
      const list = await getDictDataByTypes([...INIT_DICT_TYPES]);
      const map: Record<string, DictDataType[]> = {};
      for (const item of list ?? []) {
        const dt = item.dictType ?? '';
        if (!dt) continue;
        if (!map[dt]) map[dt] = [];
        const numVal = Number(item.value);
        const val = Number.isNaN(numVal) ? item.value : numVal;
        map[dt].push({
          dictType: dt,
          label: item.label ?? '',
          value: val,
          colorType: item.colorType,
          cssClass: item.cssClass,
        });
      }
      dictMap.value = map;
      setDictOverrides(map);
    } catch {
      // MSW 未命中或后端不可用时静默失败，fallback 到 STATIC_DICT
    }
  }

  function getDictOptions(dictType: string): DictDataType[] {
    return dictMap.value[dictType] ?? [];
  }

  return { dictMap, initDict, getDictOptions };
});
