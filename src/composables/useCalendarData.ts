/**
 * 业务日历核心数据逻辑
 * 文档 2.5 Slot 拆分逻辑、2.7 数据转换、2.3 营业时段解析
 */

import type { EventInput } from '@fullcalendar/core';

// ============== 类型定义 ==============

/** 排班时段（API 原始结构，文档 2.7 convert(slot)、5.2） */
export interface ScheduleSlot {
  id: string | number;
  startTime: string;
  endTime: string;
  statusId: number;
  lockedFlag?: boolean;
  remark?: string;
  /** 可选业务扩展参数 */
  availableSiteIds?: number[];
  roomId?: number;
  dayOfWeek?: number;
  timeFrom?: string;
  timeTo?: string;
  [key: string]: unknown;
}

/** 课程（已预约），文档 5.3，用于拆分 schedule */
export interface Lesson {
  id: string | number;
  startTime: string;
  endTime: string;
  curriculumOriginalName?: string;
  curriculum?: string;
  studentFullName?: string;
  siteName?: string;
  oneToOneOrGroupId?: number;
  reservedById?: number;
  typeId?: number;
  onlineOrOfflineId?: number;
  status?: number;
  statusName?: string;
  groupSize?: number;
  [key: string]: unknown;
}

/** FTL / Assigned 等“占用时段”，仅需时间范围参与拆分（文档 5.4） */
export interface BlockingSlot {
  id?: string | number;
  startTime: string;
  endTime: string;
  [key: string]: unknown;
}

/** 具有 startTime/endTime 的任意槽，用于重叠检测 */
export interface TimeRangeLike {
  startTime: string;
  endTime: string;
}

/** 内部时间区间（毫秒时间戳），用于拆分算法 */
export interface TimeRangeMs {
  startMs: number;
  endMs: number;
}

/** 拆分后的 schedule 片段（仍为业务结构，用于再转 Event） */
export interface ScheduleSegment extends Omit<ScheduleSlot, 'id' | 'startTime' | 'endTime'> {
  id: string;
  startTime: string;
  endTime: string;
  /** 原始 schedule 的 id，便于关联 */
  originalId: string | number;
  /** 片段序号 */
  segmentIndex: number;
}

/** FullCalendar 事件 + 业务扩展（文档 2.7 输出） */
export type CalendarEvent = EventInput & {
  extendedProps?: Record<string, unknown> & {
    eventType?: 'schedule' | 'lesson' | 'ftl' | 'assigned' | 'fixed';
    statusId?: number;
    lockedFlag?: boolean;
    originalId?: string | number;
    segmentIndex?: number;
  };
};

/** 营业时段单段（与 BusinessCalendar types 一致，文档 2.3） */
export interface BusinessHoursSegment {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

// ============== 营业时段字符串解析（文档 2.7） ==============

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const DAY_NAME_TO_DOW: Record<string, number> = Object.fromEntries(
  DAY_NAMES.map((name, i) => [name, i])
);

/**
 * 解析单个天数部分为 daysOfWeek 数组
 * - "Mon-Fri" → [1,2,3,4,5]
 * - "Sat" → [6]
 * - "Mon,Wed,Fri" → [1,3,5]
 * - "Mon-Sun" 或 "Sun-Sat" → [0,1,2,3,4,5,6]
 */
function parseDaysOfWeek(dayStr: string): number[] {
  // replace() 用于兼容未启用 ES2021 的 tsconfig；若已启用可改为 replaceAll
  const normalized = dayStr.trim().replace(/\s+/g, '');
  if (!normalized) return [];

  const result: number[] = [];
  const parts = normalized.split(',');

  for (const part of parts) {
    const dash = part.indexOf('-');
    if (dash === -1) {
      const d = DAY_NAME_TO_DOW[part];
      if (d !== undefined) result.push(d);
      continue;
    }
    const from = part.slice(0, dash).trim();
    const to = part.slice(dash + 1).trim();
    const fromDow = DAY_NAME_TO_DOW[from];
    const toDow = DAY_NAME_TO_DOW[to];
    if (fromDow === undefined || toDow === undefined) continue;
    let lo = fromDow;
    let hi = toDow;
    if (lo > hi) [lo, hi] = [hi, lo];
    for (let i = lo; i <= hi; i++) result.push(i);
  }

  const unique = [...new Set(result)].sort((a, b) => a - b);
  return unique;
}

/**
 * 将时间字符串规范为 "HH:mm"（用于 FullCalendar）
 */
function normalizeTime(t: string): string {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t.trim());
  if (!match) return '00:00';
  const [, h, m] = match;
  return `${String(Number.parseInt(h!, 10)).padStart(2, '0')}:${String(Number.parseInt(m!, 10)).padStart(2, '0')}`;
}

const BUSINESS_HOURS_PART_REGEX = /\(([^)]*)\)\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(\d{1,2}:\d{2}(?::\d{2})?)/gi;

/**
 * 解析业务营业时段字符串 → FullCalendar businessHours 数组
 * 输入示例："(Mon-Fri)09:00-18:00&&(Sat)10:00-16:00"
 * 输出：[{ daysOfWeek: [1,2,3,4,5], startTime: '09:00', endTime: '18:00' }, ...]
 */
export function parseBusinessHoursString(input: string): BusinessHoursSegment[] {
  if (!input?.trim()) return [];

  const segments: BusinessHoursSegment[] = [];
  const parts = input.split('&&').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const regex = new RegExp(BUSINESS_HOURS_PART_REGEX.source, 'gi');
    const match = regex.exec(part);
    if (!match) continue;
    const [, daysStr, startTime, endTime] = match;
    const daysOfWeek = parseDaysOfWeek(daysStr ?? '');
    if (daysOfWeek.length === 0) continue;
    segments.push({
      daysOfWeek,
      startTime: normalizeTime(startTime ?? '00:00'),
      endTime: normalizeTime(endTime ?? '24:00'),
    });
  }

  return segments;
}

// ============== 时间比较与区间 ==============

function parseToMs(timeStr: string): number {
  const s = timeStr.trim();
  if (!s) return 0;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return 0;
  return d.getTime();
}

function timeRangeLikeToMs(item: TimeRangeLike): TimeRangeMs {
  return {
    startMs: parseToMs(item.startTime),
    endMs: parseToMs(item.endTime),
  };
}

/**
 * 两段时间是否重叠（不含端点相接）
 * 重叠条件：seg.startMs < block.endMs && seg.endMs > block.startMs
 */
function overlaps(seg: TimeRangeMs, block: TimeRangeMs): boolean {
  return seg.startMs < block.endMs && seg.endMs > block.startMs;
}

/**
 * 用一条 blocker 切割一段 segment，返回 0～2 段不重叠的区间
 * 文档 2.5：将 schedule 拆成「左侧不重叠」和「右侧不重叠」两段
 */
function splitSegmentByBlocker(seg: TimeRangeMs, blocker: TimeRangeMs): TimeRangeMs[] {
  if (!overlaps(seg, blocker)) return [seg];

  const left: TimeRangeMs | null =
    seg.startMs < blocker.startMs
      ? { startMs: seg.startMs, endMs: Math.min(seg.endMs, blocker.startMs) }
      : null;
  const right: TimeRangeMs | null =
    seg.endMs > blocker.endMs
      ? { startMs: Math.max(seg.startMs, blocker.endMs), endMs: seg.endMs }
      : null;

  const result: TimeRangeMs[] = [];
  if (left != null && left.endMs > left.startMs) result.push(left);
  if (right != null && right.endMs > right.startMs) result.push(right);
  return result;
}

/** 将毫秒时间戳格式化为本地 "YYYY-MM-DD HH:mm:ss"（拆分片段用，与业务时间格式一致） */
function timeRangeMsToIso(range: TimeRangeMs): { startTime: string; endTime: string } {
  const fmt = (ms: number) => {
    const d = new Date(ms);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const sec = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}:${sec}`;
  };
  return { startTime: fmt(range.startMs), endTime: fmt(range.endMs) };
}

// ============== Slot 拆分算法（文档 2.5） ==============

/**
 * 将 schedule 用所有 blocker 切割，返回不重叠的片段（带新 id）
 * - 完全被覆盖的 schedule 返回 []
 * - 多重重叠：依次用每个 blocker 切割当前所有片段，再与下一个 blocker 切割
 */
export function splitScheduleByBlockers(
  schedule: ScheduleSlot,
  blockers: TimeRangeLike[]
): ScheduleSegment[] {
  if (!blockers.length) {
    return [
      {
        ...schedule,
        id: `${schedule.id}_0`,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        originalId: schedule.id,
        segmentIndex: 0,
      } as ScheduleSegment,
    ];
  }

  let segments: TimeRangeMs[] = [timeRangeLikeToMs(schedule)];

  for (const blocker of blockers) {
    const block = timeRangeLikeToMs(blocker);
    segments = segments.flatMap((seg) => splitSegmentByBlocker(seg, block));
    if (segments.length === 0) break;
  }

  const { id, ...rest } = schedule;
  return segments.map((seg, index) => {
    const { startTime, endTime } = timeRangeMsToIso(seg);
    return {
      ...rest,
      id: `${id}_${index}`,
      startTime,
      endTime,
      originalId: id,
      segmentIndex: index,
    } as ScheduleSegment;
  });
}

/**
 * 批量：对每个 schedule 做拆分，并与 lesson、ftl、assigned 合并为“不重叠的 schedule 片段 + 其他事件”列表
 * 返回 { scheduleSegments: ScheduleSegment[], otherEvents: 用于直接转 Event 的 lesson/ftl/assigned }
 */
export function splitSchedulesAndBlockers(
  schedules: ScheduleSlot[],
  lessons: Lesson[],
  ftlSlots: BlockingSlot[],
  assignedSlots: BlockingSlot[]
): { scheduleSegments: ScheduleSegment[]; blockers: TimeRangeLike[] } {
  const blockers: TimeRangeLike[] = [
    ...lessons,
    ...ftlSlots,
    ...assignedSlots,
  ];

  const scheduleSegments: ScheduleSegment[] = [];
  for (const schedule of schedules) {
    const segments = splitScheduleByBlockers(schedule, blockers);
    scheduleSegments.push(...segments);
  }

  return { scheduleSegments, blockers };
}

// ============== 事件转换（文档 2.7） ==============

/** 将 "YYYY-MM-DD HH:mm:ss" 或 "YYYY-MM-DD" 转为 FullCalendar 可解析的 ISO8601（含 T） */
function toIsoDateTime(timeStr: string): string {
  const s = (timeStr ?? '').trim();
  if (!s) return s;
  if (s.includes('T')) return s;
  return s.replace(/\s+/, 'T');
}

/** statusId → 展示标签（文档 2.8、5.2 简化） */
export const STATUS_ID_TO_LABEL: Record<number, string> = {
  199: 'Reserve',
  200: 'Open',
  201: 'Group',
  202: 'Fixed',
  204: 'Training',
  205: 'Offline Group',
  206: 'Offline Backup',
  700: 'Team Master',
  701: 'Tiktok Live Selling',
  702: 'Coding Classes',
  703: 'Coding Tasks',
  704: 'Eiken Rater',
  705: 'Others',
  706: 'Offline Tasks',
  707: 'Tiktok Video Tasks',
  708: 'QM Tasks',
  100: 'Close',
  101: 'Leave',
  102: 'Break',
  103: 'Absent',
  104: 'Resigned',
  105: 'AWOL',
  106: 'Late',
  107: 'Undertime',
  108: 'Trainee',
};

/** statusId → className 前缀（用于样式） */
export function statusIdToClassName(statusId: number): string {
  if (statusId === 199 || statusId === 200 || statusId === 202) return 'fc-event-schedule-open';
  if (statusId === 201 || statusId === 205) return 'fc-event-schedule-group';
  if (statusId >= 204 && statusId <= 208) return 'fc-event-schedule-task';
  if (statusId >= 700 && statusId <= 708) return 'fc-event-schedule-task';
  if (statusId >= 100 && statusId <= 108) return 'fc-event-schedule-inactive';
  return 'fc-event-schedule';
}

/**
 * convert(slot) — 文档 2.7
 * 将 schedule（或拆分后的 segment）转为 FullCalendar Event
 */
export function convertSlotToEvent(slot: ScheduleSlot | ScheduleSegment): CalendarEvent {
  const locked = slot.lockedFlag === true;
  const statusId = Number(slot.statusId);
  const title = STATUS_ID_TO_LABEL[statusId] ?? `Slot ${statusId}`;
  const segment = 'segmentIndex' in slot ? slot : undefined;

  const extendedProps: CalendarEvent['extendedProps'] = {
    eventType: 'schedule',
    statusId,
    lockedFlag: slot.lockedFlag === true || slot.lockedFlag === false ? slot.lockedFlag : undefined,
    remark: typeof slot.remark === 'string' ? slot.remark : undefined,
    ...(segment && {
      originalId: segment.originalId as string | number,
      segmentIndex: segment.segmentIndex as number,
    }),
  };
  return {
    id: String(slot.id),
    title,
    start: toIsoDateTime(slot.startTime),
    end: toIsoDateTime(slot.endTime),
    editable: !locked,
    draggable: !locked,
    className: statusIdToClassName(statusId),
    extendedProps,
  };
}

/**
 * convertLesson(lesson) — 文档 2.7
 */
export function convertLessonToEvent(lesson: Lesson): CalendarEvent {
  const title =
    lesson.curriculumOriginalName ?? lesson.curriculum ?? `Lesson ${lesson.id}`;
  return {
    id: `lesson_${lesson.id}`,
    title,
    start: toIsoDateTime(lesson.startTime),
    end: toIsoDateTime(lesson.endTime),
    editable: false,
    draggable: false,
    className: 'fc-event-lesson',
    extendedProps: {
      eventType: 'lesson',
      ...lesson,
    },
  };
}

/**
 * convertFTL / convertAssigned — 文档 2.7
 */
export function convertBlockingSlotToEvent(
  slot: BlockingSlot,
  eventType: 'ftl' | 'assigned'
): CalendarEvent {
  const label = eventType === 'ftl' ? 'FTL' : 'Assigned';
  return {
    id: `${eventType}_${slot.id ?? Math.random().toString(36).slice(2)}`,
    title: label,
    start: toIsoDateTime(slot.startTime),
    end: toIsoDateTime(slot.endTime),
    editable: false,
    draggable: false,
    className: `fc-event-${eventType}`,
    extendedProps: {
      eventType,
      ...slot,
    },
  };
}

// ============== Composable 聚合 ==============

/**
 * 将业务数据：schedules + lessons + ftl + assigned → 拆分后的 schedule 片段 + 全部转为 FullCalendar events
 */
export function useCalendarData() {
  function buildEventsFromSchedulesAndBlockers(
    schedules: ScheduleSlot[],
    lessons: Lesson[],
    ftlSlots: BlockingSlot[] = [],
    assignedSlots: BlockingSlot[] = []
  ): CalendarEvent[] {
    const { scheduleSegments } = splitSchedulesAndBlockers(
      schedules,
      lessons,
      ftlSlots,
      assignedSlots
    );

    const events: CalendarEvent[] = [];

    for (const seg of scheduleSegments) {
      events.push(convertSlotToEvent(seg));
    }
    for (const lesson of lessons) {
      events.push(convertLessonToEvent(lesson));
    }
    for (const ftl of ftlSlots) {
      events.push(convertBlockingSlotToEvent(ftl, 'ftl'));
    }
    for (const a of assignedSlots) {
      events.push(convertBlockingSlotToEvent(a, 'assigned'));
    }

    return events;
  }

  return {
    parseBusinessHoursString,
    splitScheduleByBlockers,
    splitSchedulesAndBlockers,
    convertSlotToEvent,
    convertLessonToEvent,
    convertBlockingSlotToEvent,
    buildEventsFromSchedulesAndBlockers,
    STATUS_ID_TO_LABEL,
    statusIdToClassName,
  };
}

// ============== Slot 拆分算法演示（注释 + 示例数据） ==============
/*
 * 拆分逻辑说明：
 *
 * 1. 输入：一条 schedule [10:00, 12:00]，blockers 为 [10:30-11:00]（一条 lesson）
 *    - 重叠检测：10:00 < 11:00 && 12:00 > 10:30 → 重叠
 *    - 左侧不重叠：[10:00, 10:30]，右侧不重叠：[11:00, 12:00]
 *    - 输出两段，id 为 originalId_0、originalId_1
 *
 * 2. 完全覆盖：schedule [10:00, 11:00]，blocker [10:00, 11:00]
 *    - 左侧 [10:00, 10:00] 无效，右侧 [11:00, 11:00] 无效
 *    - 输出 []，该 schedule 不渲染
 *
 * 3. 多重重叠：schedule [09:00, 12:00]，blockers [09:30-10:00], [11:00-11:30]
 *    - 先用 B1 切：得到 [09:00, 09:30], [10:00, 12:00]
 *    - 再用 B2 切 [09:00, 09:30] 不重叠保留；[10:00, 12:00] 被切为 [10:00, 11:00], [11:30, 12:00]
 *    - 最终三段：[09:00, 09:30], [10:00, 11:00], [11:30, 12:00]
 *
 * 单元测试示例（可在 Vitest 等中运行）：
 *
 * const schedule: ScheduleSlot = {
 *   id: 's1',
 *   startTime: '2025-02-05 10:00:00',
 *   endTime: '2025-02-05 12:00:00',
 *   statusId: 200,
 *   lockedFlag: false,
 * };
 * const blockers: TimeRangeLike[] = [
 *   { startTime: '2025-02-05 10:30:00', endTime: '2025-02-05 11:00:00' },
 * ];
 * const segments = splitScheduleByBlockers(schedule, blockers);
 * expect(segments).toHaveLength(2);
 * expect(segments[0].startTime).toBe('2025-02-05 10:00:00');
 * expect(segments[0].endTime).toBe('2025-02-05 10:30:00');
 * expect(segments[1].startTime).toBe('2025-02-05 11:00:00');
 * expect(segments[1].endTime).toBe('2025-02-05 12:00:00');
 * expect(segments[0].id).toBe('s1_0');
 * expect(segments[1].id).toBe('s1_1');
 *
 * // 完全覆盖
 * const fullCover = splitScheduleByBlockers(schedule, [
 *   { startTime: '2025-02-05 10:00:00', endTime: '2025-02-05 12:00:00' },
 * ]);
 * expect(fullCover).toHaveLength(0);
 */
