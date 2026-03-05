/**
 * Day.js 全局配置与工具封装
 */
import dayjs, { type Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

dayjs.extend(relativeTime);
dayjs.extend(utc);

/** 已注册的 locale 列表，便于与 i18n 的 locale 同步 */
const LOCALE_MAP: Record<string, string> = {
  'zh-CN': 'zh-cn',
  en: 'en',
};

/** 可接受的日期类型 */
export type DateInput = string | number | Date | Dayjs;

/**
 * 根据当前语言设置 dayjs 的 locale（与 vue-i18n 的 locale 保持一致时调用）
 */
export function setDayjsLocale(locale: string): void {
  const dayjsLocale = LOCALE_MAP[locale] ?? locale.toLowerCase();
  if (dayjsLocale) dayjs.locale(dayjsLocale);
}

/**
 * 格式化为相对时间（如「3 分钟前」）
 */
export function formatRelative(date: DateInput): string {
  return dayjs(date).fromNow();
}

/**
 * 格式化为本地日期时间
 */
export function formatDateTime(
  date: DateInput,
  template = 'YYYY-MM-DD HH:mm:ss'
): string {
  return dayjs(date).format(template);
}

/**
 * 格式化为本地日期
 */
export function formatDate(
  date: DateInput,
  template = 'YYYY-MM-DD'
): string {
  return dayjs(date).format(template);
}

export default dayjs;
