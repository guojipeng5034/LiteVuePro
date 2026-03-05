<template>
  <div class="calendar-demo-page w-full h-full overflow-auto p-6">
    <el-card shadow="hover" class="mb-4">
      <template #header>
        <span>{{ t('demo.calendar.title') }}</span>
      </template>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {{ t('demo.calendar.desc') }}
      </p>
      <!-- 演示：自定义 Slot / 自定义右键菜单 -->
      <div class="mb-4 flex items-center gap-4 flex-wrap">
        <el-checkbox v-model="useCustomSlot">自定义 Slot 组件</el-checkbox>
        <el-checkbox v-model="useCustomContextMenu">自定义右键菜单</el-checkbox>
      </div>
      <!-- 文档 1.1 教师排班：周为主、可编辑、教师 ID + 日期范围；key 随自定义选项变化以强制重新挂载并重新渲染 -->
      <div class="h-[600px] min-h-0 flex flex-col">
        <BusinessCalendar
          :key="calendarRenderKey"
          initial-view="timeGridWeek"
          :business-hours="businessHours"
          :events="calendarEvents"
          :readonly="readonly"
          :config="calendarConfig"
          :event-content-component="useCustomSlot ? DemoCustomSlot : undefined"
          :context-menu-component="useCustomContextMenu ? DemoCustomContextMenu : undefined"
          @dates-set="onDatesSet"
          @navigate="onNavigate"
          @date-select="onDateSelect"
          @event-click="onEventClick"
          @event-change="onEventChange"
          @context-menu-action="onContextMenuAction"
        />
      </div>
      <div class="mt-4 flex items-center gap-4 flex-wrap">
        <el-checkbox v-model="readonly">{{ t('demo.calendar.readonly') }}</el-checkbox>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ t('demo.calendar.checklistHint') }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          当前查看范围起点：<strong>{{ dataWeekStart }}</strong>
          · 当前传入事件数：<strong>{{ calendarEvents.length }}</strong> 个
          （切换周/月或日期选择器会触发 dates-set，新数据会渲染到日历）
        </span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'demo-calendar' });

import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BusinessCalendar from '@/components/BusinessCalendar/index.vue';
import DemoCustomSlot from '@/views/Demo/DemoCustomSlot.vue';
import DemoCustomContextMenu from '@/views/Demo/DemoCustomContextMenu.vue';
import {
  useCalendarData,
  type ScheduleSlot,
  type Lesson,
  type BlockingSlot,
} from '@/composables/useCalendarData';

const { t } = useI18n();

// ============== 演示开关：自定义 Slot / 自定义右键菜单 ==============
const useCustomSlot = ref(false);
const useCustomContextMenu = ref(true);
/** 切换自定义 Slot/右键菜单时变化，用作 BusinessCalendar 的 key，强制重新挂载并重新渲染 */
const calendarRenderKey = computed(() => `${useCustomSlot.value}-${useCustomContextMenu.value}`);
const { parseBusinessHoursString, buildEventsFromSchedulesAndBlockers } = useCalendarData();

// ============== 文档 1.1 教师排班：Mock 数据（按当前日期所在周生成） ==============
const TEACHER_ID = 10001;

/** 取某日期所在周的周一，返回 YYYY-MM-DD */
function getMondayOfWeek(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

/** 在 YYYY-MM-DD 上加 N 天 */
function addDays(ymd: string, days: number): string {
  const d = new Date(ymd + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 当前周周一，用于初始或回退时的模拟数据 */
const demoWeekStart = computed(() => getMondayOfWeek(new Date()));

/**
 * 当前「查看范围」对应的周一起始（由 dates-set 回调更新，模拟按范围查询后渲染）
 * 切换周/月或头部日期选择器会触发 dates-set，此处更新后 mock 数据按新范围生成，实现「回调后查询新数据并渲染」
 */
const viewedRangeStart = ref<string | null>(null);

/** 当前视图类型（用于月视图时生成整月数据） */
const currentViewType = ref<string>('timeGridWeek');

/** 从 FullCalendar startStr 解析出周视图的周一或月视图的当月 1 日 */
function getRangeStartFromDatesSet(startStr: string, viewType: string): string {
  const d = new Date(startStr.replace(/T.*/, ''));
  if (viewType === 'dayGridMonth') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** 实际用于生成 mock 数据的周一起始：优先使用当前查看范围，否则用本周 */
const dataWeekStart = computed(() => viewedRangeStart.value ?? demoWeekStart.value);

/** 获取某月所有日期 YYYY-MM-DD（当月 1 日到月末） */
function getMonthDays(monthFirst: string): string[] {
  const parts = monthFirst.split('-').map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const lastDay = new Date(y, m, 0).getDate();
  const days: string[] = [];
  for (let day = 1; day <= lastDay; day++) {
    days.push(`${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return days;
}

/** 基于范围字符串的种子随机：同一范围得到相同序列，不同日期选择得到不同随机数据 */
function createSeededRandom(seedStr: string): () => number {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = Math.imul(31, h) + seedStr.charCodeAt(i);
  const seed = (h >>> 0) || 1;
  let step = 0;
  return function next() {
    const x = Math.sin(seed * 0.001 + step * 0.1) * 10000;
    step += 1;
    return Math.abs(x - Math.floor(x));
  };
}

/** 从数组中按种子随机取一项 */
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

/** Mock 排班时段：周视图生成一周 5 天，月视图生成整月（按范围种子随机化） */
function buildMockSchedules(rangeStart: string, viewType: string): ScheduleSlot[] {
  const rng = createSeededRandom(rangeStart);
  const statusIds = [199, 200, 201, 202, 204, 205, 206, 100];
  if (viewType === 'dayGridMonth') {
    const days = getMonthDays(rangeStart);
    const slots: ScheduleSlot[] = [];
    days.forEach((d, di) => {
      if (rng() > 0.25) {
        slots.push({
          id: `s-${rangeStart}-${di}-0`,
          startTime: `${d} 09:00:00`,
          endTime: `${d} 12:00:00`,
          statusId: pick(rng, statusIds),
          lockedFlag: rng() > 0.7,
        });
      }
      if (rng() > 0.3) {
        slots.push({
          id: `s-${rangeStart}-${di}-1`,
          startTime: `${d} 14:00:00`,
          endTime: `${d} 18:00:00`,
          statusId: pick(rng, statusIds),
          lockedFlag: rng() > 0.7,
        });
      }
    });
    return slots;
  }
  const mon = rangeStart;
  const tue = addDays(mon, 1);
  const wed = addDays(mon, 2);
  const thu = addDays(mon, 3);
  const fri = addDays(mon, 4);
  const base: ScheduleSlot[] = [
    { id: 's1', startTime: `${mon} 09:00:00`, endTime: `${mon} 12:00:00`, statusId: 200, lockedFlag: false },
    { id: 's2', startTime: `${mon} 14:00:00`, endTime: `${mon} 18:00:00`, statusId: 199, lockedFlag: false, remark: '可预约' },
    { id: 's1a', startTime: `${mon} 08:00:00`, endTime: `${mon} 08:30:00`, statusId: 202, lockedFlag: false },
    { id: 's1b', startTime: `${mon} 12:30:00`, endTime: `${mon} 13:00:00`, statusId: 200, lockedFlag: false },
    { id: 's1c', startTime: `${mon} 19:00:00`, endTime: `${mon} 20:00:00`, statusId: 199, lockedFlag: false },
    { id: 's3', startTime: `${tue} 10:00:00`, endTime: `${tue} 12:00:00`, statusId: 201, lockedFlag: false },
    { id: 's4', startTime: `${tue} 14:00:00`, endTime: `${tue} 16:00:00`, statusId: 204, lockedFlag: false },
    { id: 's3a', startTime: `${tue} 08:30:00`, endTime: `${tue} 09:30:00`, statusId: 200, lockedFlag: false },
    { id: 's3b', startTime: `${tue} 16:30:00`, endTime: `${tue} 17:30:00`, statusId: 205, lockedFlag: false },
    { id: 's3c', startTime: `${tue} 20:00:00`, endTime: `${tue} 21:00:00`, statusId: 199, lockedFlag: true, remark: '晚间可约' },
    { id: 's5', startTime: `${wed} 09:00:00`, endTime: `${wed} 12:00:00`, statusId: 200, lockedFlag: true },
    { id: 's6', startTime: `${wed} 14:00:00`, endTime: `${wed} 17:00:00`, statusId: 100, lockedFlag: false },
    { id: 's5a', startTime: `${wed} 07:00:00`, endTime: `${wed} 08:00:00`, statusId: 206, lockedFlag: false },
    { id: 's5b', startTime: `${wed} 18:00:00`, endTime: `${wed} 19:00:00`, statusId: 200, lockedFlag: false },
    { id: 's7', startTime: `${thu} 10:00:00`, endTime: `${thu} 18:00:00`, statusId: 200, lockedFlag: false },
    { id: 's7a', startTime: `${thu} 09:00:00`, endTime: `${thu} 10:00:00`, statusId: 201, lockedFlag: false },
    { id: 's7b', startTime: `${thu} 06:00:00`, endTime: `${thu} 07:00:00`, statusId: 199, lockedFlag: false },
    { id: 's8', startTime: `${fri} 08:00:00`, endTime: `${fri} 09:00:00`, statusId: 200, lockedFlag: false },
    { id: 's9', startTime: `${fri} 09:30:00`, endTime: `${fri} 11:00:00`, statusId: 199, lockedFlag: false },
    { id: 's10', startTime: `${fri} 11:30:00`, endTime: `${fri} 13:00:00`, statusId: 204, lockedFlag: false },
    { id: 's11', startTime: `${fri} 14:00:00`, endTime: `${fri} 16:00:00`, statusId: 201, lockedFlag: false },
    { id: 's12', startTime: `${fri} 17:00:00`, endTime: `${fri} 18:30:00`, statusId: 100, lockedFlag: false, remark: 'Inactive' },
    { id: 's13', startTime: `${fri} 21:00:00`, endTime: `${fri} 22:00:00`, statusId: 202, lockedFlag: false },
  ];
  return base.map((s, i) => ({
    ...s,
    id: `s-${rangeStart}-${i}`,
    statusId: pick(rng, statusIds),
    lockedFlag: rng() > 0.7,
  }));
}

const CURRICULUM_1V1 = ['English 1v1', 'Math 1v1', 'Speaking 1v1', 'Writing 1v1', 'Reading 1v1', 'Science 1v1', 'Art 1v1'];
const CURRICULUM_GROUP = ['Group Class', 'Group Workshop', 'Group Lab', 'Group Talk'];
const STUDENTS = ['Student A', 'Student B', 'Student C', 'Student D', 'Student E', 'Student F', 'Student G'];
const SITES = ['Site A', 'Site B', 'Site C'];

/** Mock 课程：周视图一周 7 条，月视图在整月内分散（按范围种子随机化） */
function buildMockLessons(rangeStart: string, viewType: string): Lesson[] {
  const rng = createSeededRandom(rangeStart);
  if (viewType === 'dayGridMonth') {
    const days = getMonthDays(rangeStart);
    const lessons: Lesson[] = [];
    days.forEach((d, i) => {
      if (rng() > 0.5) {
        lessons.push({
          id: `l-${rangeStart}-${i}`,
          startTime: `${d} 10:00:00`,
          endTime: `${d} 10:30:00`,
          curriculumOriginalName: pick(rng, CURRICULUM_1V1),
          studentFullName: pick(rng, STUDENTS),
          siteName: pick(rng, SITES),
          oneToOneOrGroupId: 1,
        });
      }
      if (rng() > 0.6) {
        lessons.push({
          id: `l-${rangeStart}-${i}-g`,
          startTime: `${d} 14:00:00`,
          endTime: `${d} 15:00:00`,
          curriculumOriginalName: pick(rng, CURRICULUM_GROUP),
          siteName: pick(rng, SITES),
          oneToOneOrGroupId: 2,
          groupSize: 4 + Math.floor(rng() * 6),
        });
      }
    });
    return lessons;
  }
  const mon = rangeStart;
  const tue = addDays(mon, 1);
  const wed = addDays(mon, 2);
  const thu = addDays(mon, 3);
  const fri = addDays(mon, 4);
  const base = [
    { start: `${mon} 10:00:00`, end: `${mon} 10:30:00`, type: 1 as const },
    { start: `${mon} 11:00:00`, end: `${mon} 11:30:00`, type: 1 as const },
    { start: `${tue} 10:30:00`, end: `${tue} 11:30:00`, type: 2 as const },
    { start: `${tue} 14:30:00`, end: `${tue} 15:00:00`, type: 1 as const },
    { start: `${wed} 09:30:00`, end: `${wed} 10:00:00`, type: 1 as const },
    { start: `${thu} 11:00:00`, end: `${thu} 12:00:00`, type: 2 as const },
    { start: `${fri} 10:00:00`, end: `${fri} 10:30:00`, type: 1 as const },
  ];
  return base
    .filter(() => rng() > 0.15)
    .map((b, i): Lesson => ({
      id: `l-${rangeStart}-${i}`,
      startTime: b.start,
      endTime: b.end,
      curriculumOriginalName: b.type === 1 ? pick(rng, CURRICULUM_1V1) : pick(rng, CURRICULUM_GROUP),
      studentFullName: b.type === 1 ? pick(rng, STUDENTS) : undefined,
      siteName: pick(rng, SITES),
      oneToOneOrGroupId: b.type,
      groupSize: b.type === 2 ? 4 + Math.floor(rng() * 6) : undefined,
    }));
}

/** Mock FTL / Assigned：周视图 5 天内随机，月视图在整月内随机 */
function buildMockBlockingSlots(rangeStart: string, viewType: string): { ftl: BlockingSlot[]; assigned: BlockingSlot[] } {
  const rng = createSeededRandom(rangeStart);
  const days =
    viewType === 'dayGridMonth' ? getMonthDays(rangeStart) : [rangeStart, addDays(rangeStart, 1), addDays(rangeStart, 2), addDays(rangeStart, 3), addDays(rangeStart, 4)];
  const ftlCount = viewType === 'dayGridMonth' ? 5 + Math.floor(rng() * 10) : 1 + Math.floor(rng() * 3);
  const assignedCount = viewType === 'dayGridMonth' ? 5 + Math.floor(rng() * 8) : 1 + Math.floor(rng() * 2);
  const ftl: BlockingSlot[] = [];
  const assigned: BlockingSlot[] = [];
  for (let i = 0; i < ftlCount; i++) {
    const d = pick(rng, days);
    const h = 8 + Math.floor(rng() * 10);
    ftl.push({
      id: `ftl-${rangeStart}-${i}`,
      startTime: `${d} ${String(h).padStart(2, '0')}:00:00`,
      endTime: `${d} ${String(Math.min(h + 2, 23)).padStart(2, '0')}:00:00`,
    });
  }
  for (let i = 0; i < assignedCount; i++) {
    const d = pick(rng, days);
    const h = 12 + Math.floor(rng() * 6);
    assigned.push({
      id: `a-${rangeStart}-${i}`,
      startTime: `${d} ${String(h).padStart(2, '0')}:00:00`,
      endTime: `${d} ${String(h + 1).padStart(2, '0')}:00:00`,
    });
  }
  return { ftl, assigned };
}

// ============== 营业时段（文档 2.3 / 2.7） ==============
const businessHours = parseBusinessHoursString('(Mon-Fri)09:00-18:00&&(Sat)10:00-16:00');

// ============== 数据预处理：按「当前查看范围」+ 视图类型生成 Mock（周视图一周，月视图整月） ==============
const mockSchedules = computed(() => buildMockSchedules(dataWeekStart.value, currentViewType.value));
const mockLessons = computed(() => buildMockLessons(dataWeekStart.value, currentViewType.value));
const mockBlockingSlots = computed(() => buildMockBlockingSlots(dataWeekStart.value, currentViewType.value));

const calendarEvents = computed(() =>
  buildEventsFromSchedulesAndBlockers(
    mockSchedules.value,
    mockLessons.value,
    mockBlockingSlots.value.ftl,
    mockBlockingSlots.value.assigned
  )
);

// ============== 日历配置（文档 2.1 / 1.1 教师排班：周为主） ==============
const readonly = ref(false);
// 时间轴：00:00–24:00，每格 30 分钟（onlyShowBusinessHours: false 使用全天）
const calendarConfig = computed(() => ({
  showHeader: true,
  singleWeek: false,
  onlyShowBusinessHours: false,
  slotDuration: '00:30:00',
  allowedViews: ['dayGridMonth', 'timeGridWeek'] as ('dayGridMonth' | 'timeGridWeek')[],
}));

// ============== 事件处理：所有回调均打印控制台，并支撑「回调后查询新数据并渲染」演示 ==============

const LOG = '[Calendar Demo]';

/** dates-set：视图范围变化时更新「当前查看范围」与视图类型，模拟按 startStr/endStr 查询后渲染 */
function onDatesSet(arg: { startStr: string; endStr: string; view: { type: string } }): void {
  currentViewType.value = arg.view.type;
  const rangeStart = getRangeStartFromDatesSet(arg.startStr, arg.view.type);
  viewedRangeStart.value = rangeStart;
  console.log(`${LOG} [dates-set] 视图范围变化 → 模拟按范围查询数据并渲染`, {
    viewType: arg.view.type,
    startStr: arg.startStr,
    endStr: arg.endStr,
    dataWeekStart: rangeStart,
    teacherId: TEACHER_ID,
  });
}

/** navigate：头部日期选择器选择日期/月份 */
function onNavigate(payload: { date: Date; viewType: string; dateStr: string }): void {
  console.log(`${LOG} [navigate] 日期选择器选择`, {
    dateStr: payload.dateStr,
    viewType: payload.viewType,
    date: payload.date.toISOString?.(),
  });
}

/** date-select：选中空白 30 分钟 */
function onDateSelect(payload: {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  allDay: boolean;
  jsEvent: MouseEvent | null;
}): void {
  console.log(`${LOG} [date-select] 选中空白时段`, {
    startStr: payload.startStr,
    endStr: payload.endStr,
  });
}

/** event-click：点击事件（左键） */
function onEventClick(payload: {
  event: { id: string; title: string; extendedProps: Record<string, unknown> };
  jsEvent: MouseEvent;
  isRightClick: boolean;
}): void {
  if (payload.isRightClick) return;
  const ext = payload.event.extendedProps ?? {};
  const eventType = ext.eventType as string;
  console.log(`${LOG} [event-click] 点击事件`, {
    eventId: payload.event.id,
    title: payload.event.title,
    eventType,
  });
  if (eventType === 'lesson') {
    const oneToOneOrGroupId = ext.oneToOneOrGroupId as number;
    console.log(`${LOG} 打开课程详情弹窗`, oneToOneOrGroupId === 2 ? 'LessonGroupDetail' : 'LessonDetail');
  }
}

/** event-change：拖拽/缩放事件时间 */
function onEventChange(payload: {
  eventId: string;
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  isMove: true;
  startTimeBeforeMove: string;
  endTimeBeforeMove: string;
}): void {
  console.log(`${LOG} [event-change] 事件时间变更`, {
    eventId: payload.eventId,
    newStart: payload.startStr,
    newEnd: payload.endStr,
    before: { start: payload.startTimeBeforeMove, end: payload.endTimeBeforeMove },
  });
}

/** context-menu-action：右键菜单选择一项；slot 右键可获取属性并处理 Lock/Del */
function onContextMenuAction(payload: {
  action: string;
  target: 'slot' | 'event';
  selection?: { startStr: string; endStr: string };
  event?: { id: string; title: string; extendedProps: Record<string, unknown> };
}): void {
  const { action, target, selection, event: ev } = payload;
  // 右键 slot（事件块）时打印完整属性，便于演示获取 slot 信息
  console.log(`${LOG} [context-menu-action] 右键菜单`, {
    action,
    target,
    slotProps: ev
      ? {
          id: ev.id,
          title: ev.title,
          extendedProps: ev.extendedProps,
        }
      : undefined,
    selection: selection ? { startStr: selection.startStr, endStr: selection.endStr } : undefined,
  });
  switch (action) {
    case 'Reserve':
      console.log(`${LOG} → 打开 Reserve 预约课程弹窗`);
      break;
    case 'Edit':
      console.log(`${LOG} → 打开 Edit 弹窗`);
      break;
    case 'Lock':
      console.log(`${LOG} → 锁定 slot`, ev?.id);
      break;
    case 'Unlock':
      console.log(`${LOG} → 解锁 slot`, ev?.id);
      break;
    case 'Notes':
      console.log(`${LOG} → 打开备注弹窗`);
      break;
    case 'Remove':
      console.log(`${LOG} → 删除 slot`, ev?.id);
      break;
    case 'Detail':
      console.log(`${LOG} → 打开课程详情`);
      break;
    case 'Active':
    case 'Tasks':
    case 'Inactive':
      console.log(`${LOG} → 空白处创建新 slot`, action);
      break;
    default:
      break;
  }
}

onMounted(() => {
  console.log('[Calendar Demo] 教师排班场景已加载，Mock 数据已做 Slot 拆分');
});

/*
 * 文档 4.0 业务与逻辑检查清单（本 Demo 覆盖）：
 * 4.1 视图与导航：月/周展示、切换、上一/下一、今天 ✓
 * 4.2 交互：点击空白 30 分钟、点击事件详情/菜单、拖拽、禁止跨天、过去时段 revert、datesSet 懒加载 ✓
 * 4.3 配置：header、readonly、businessHours、onlyShowBusinessHours、slotDuration、singleWeek、nowIndicator、今日高亮 ✓
 * 4.4 事件类型：schedule(Open/Group/Task/Inactive)、lesson(1v1/Group)、ftl/assigned、eventContent、锁定/过期/备注样式 ✓
 * 4.5 业务：右键菜单、Reserve/Edit/Lock/Notes/Remove、Slot 拆分、数据转换、阻止默认右键 ✓
 */
</script>

<style lang="scss" scoped>
.calendar-demo-page {
  @apply w-full min-w-0;
}
</style>
