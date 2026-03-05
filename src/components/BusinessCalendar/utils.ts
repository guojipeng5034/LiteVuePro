/**
 * 营业时段与高度计算工具
 * 文档 2.3：onlyShowBusinessHours 时从 businessHours 计算 slotMinTime/slotMaxTime；
 * 周视图高度 = slot 数量 × slotHeight
 */

import type { BusinessHoursSegment } from './types';
import { SLOT_HEIGHT_PX } from './types';

/** 将 "HH:mm" 或 "HH:mm:ss" 解析为从 0 点起的分钟数 */
export function timeStringToMinutes(time: string): number {
  const parts = time.trim().split(/[:\s]/).map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  return h * 60 + m + s / 60;
}

/** 将分钟数格式化为 FullCalendar 接受的 "HH:mm:00" */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/**
 * 从 businessHours 数组计算全局最小开始时间、最大结束时间（分钟数）
 */
export function getBusinessHoursRange(segments: BusinessHoursSegment[]): { minStart: number; maxEnd: number } | null {
  if (!segments?.length) return null;
  let minStart = 24 * 60;
  let maxEnd = 0;
  for (const seg of segments) {
    const start = timeStringToMinutes(seg.startTime);
    const end = timeStringToMinutes(seg.endTime);
    if (start < minStart) minStart = start;
    if (end > maxEnd) maxEnd = end;
  }
  if (minStart >= maxEnd) return null;
  return { minStart, maxEnd };
}

/**
 * 根据营业时段计算 slotMinTime / slotMaxTime（仅当 onlyShowBusinessHours 且 businessHours 有效时使用）
 */
export function getSlotMinMaxFromBusinessHours(
  segments: BusinessHoursSegment[] | undefined
): { slotMinTime: string; slotMaxTime: string } | null {
  const range = getBusinessHoursRange(segments ?? []);
  if (!range) return null;
  return {
    slotMinTime: minutesToTimeString(range.minStart),
    slotMaxTime: minutesToTimeString(range.maxEnd),
  };
}

/**
 * 解析 slotDuration 字符串（如 "00:30:00" 或 "00:30"）为分钟数
 */
export function parseSlotDurationMinutes(slotDuration: string): number {
  const parts = slotDuration.trim().split(/[:\s]/).map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const s = parts[2] ?? 0;
  return h * 60 + m + s / 60;
}

/**
 * 周视图 contentHeight：根据 slot 数量与单格高度计算
 * 文档 2.3：周视图根据 slot 数量和 slotDuration 计算高度
 */
export function computeWeekContentHeight(
  slotMinTime: string,
  slotMaxTime: string,
  slotDuration: string,
  slotHeightPx: number = SLOT_HEIGHT_PX
): number {
  const minM = timeStringToMinutes(slotMinTime);
  const maxM = timeStringToMinutes(slotMaxTime);
  const durationM = parseSlotDurationMinutes(slotDuration);
  if (durationM <= 0 || maxM <= minM) return 400;
  const slotCount = (maxM - minM) / durationM;
  return Math.round(slotCount * slotHeightPx);
}
