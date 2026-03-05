/**
 * 日期时间格式化（表格 formatter 等）
 * 基于 dayjs，与 i18n 语言同步由 setDayjsLocale 保证
 */
import type { DateInput } from './dayjs';
import { formatDateTime } from './dayjs';

/**
 * 表格列 formatter：将日期时间格式化为 YYYY-MM-DD HH:mm:ss
 */
export function dateFormatter(_row: unknown, _column: unknown, cellValue: DateInput): string {
  if (cellValue == null || cellValue === '') return '';
  return formatDateTime(cellValue);
}
