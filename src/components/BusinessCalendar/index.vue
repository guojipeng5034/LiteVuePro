<template>
  <div class="business-calendar flex flex-col w-full h-full min-h-0">
    <!-- 自定义 Header：不使用 FullCalendar 自带 toolbar（文档 2.1） -->
    <header
      v-if="showHeader"
      class="business-calendar__header flex items-center gap-2 flex-wrap shrink-0 py-2 px-1 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-1">
        <el-button size="small" class="text-gray-600 dark:text-gray-300" @click="onPrev">
          <Icon icon="mdi:chevron-left" class="text-base text-inherit" />
        </el-button>
        <el-button size="small" class="text-gray-600 dark:text-gray-300" @click="onNext">
          <Icon icon="mdi:chevron-right" class="text-base text-inherit" />
        </el-button>
        <el-button size="small" @click="onToday">{{ todayLabel }}</el-button>
      </div>
      <div v-if="allowedViews.length > 1" class="flex items-center gap-1 ml-2">
        <el-button
          v-for="view in allowedViews"
          :key="view"
          size="small"
          :type="currentViewType === view ? 'primary' : 'default'"
          @click="onChangeView(view)"
        >
          {{ viewLabel(view) }}
        </el-button>
      </div>
      <div class="flex-1 min-w-0" />
      <el-date-picker
        v-model="headerDate"
        :type="currentViewType === 'dayGridMonth' ? 'month' : 'date'"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        :placeholder="headerDatePlaceholder"
        size="small"
        class="business-calendar__header-date-picker w-36"
        @change="onHeaderDateChange"
      />
    </header>

    <!-- FullCalendar 容器：月视图内容多时可纵向滚动；--bc-slot-height 控制周视图每格高度 -->
    <div
      class="business-calendar__body flex-1 min-h-0 overflow-auto relative"
      :style="{ '--bc-slot-height': slotHeightCss }"
      @contextmenu.prevent="onCalendarContextMenu"
    >
      <FullCalendar ref="fullCalendarRef" :options="calendarOptions" class="business-calendar__fc h-full" />
      <!-- 右键菜单：自定义组件或内置默认（文档 2.6 / 6.1） -->
      <Teleport to="body">
        <component
          v-if="contextMenuComponent && contextMenu.visible"
          :is="contextMenuComponent"
          :visible="contextMenu.visible"
          :x="contextMenu.x"
          :y="contextMenu.y"
          :target="contextMenu.type === 'event' ? 'event' : 'slot'"
          :selection="contextMenuSelection"
          :event="contextMenu.type === 'event' ? contextMenu.event : undefined"
          :items="contextMenuItems"
          @action="onContextMenuAction"
          @close="closeContextMenu"
        />
        <div
          v-else-if="contextMenu.visible"
          class="business-calendar__context-menu fixed z-9999 min-w-36 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-lg py-1"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px', zIndex: 9999 }"
        >
          <button
            v-for="item in contextMenuItems"
            :key="item.action"
            type="button"
            class="w-full text-left px-3 py-2 text-sm text-inherit bg-transparent border-0 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="item.disabled"
            @click="onContextMenuAction(item.action)"
          >
            {{ item.label }}
          </button>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BusinessCalendar' });

import { ref, computed, watch, nextTick, onMounted, onUnmounted, createApp } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import zhCnLocale from '@fullcalendar/core/locales/zh-cn';
import type { CalendarApi, DatesSetArg, EventContentArg, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import type { DateClickArg } from '@fullcalendar/interaction';
import {
  type BusinessCalendarProps,
  type BusinessHoursSegment,
  type ViewType,
  DEFAULT_VIEW,
  DEFAULT_SLOT_DURATION,
  DEFAULT_ALLOWED_VIEWS,
  DEFAULT_MIN_SELECT_MINUTES,
  SLOT_HEIGHT_PX,
} from './types';
import { getSlotMinMaxFromBusinessHours, computeWeekContentHeight } from './utils';

/** 文档 2.4 / 5.8：按 eventType 与 statusId 生成自定义 event 内容 HTML */
function escapeHtml(s: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return s.replace(/[&<>"']/g, (ch) => map[ch] ?? ch);
}

/** 内置默认：statusId → 颜色类名；可被 config.statusIdToColorClass 覆盖 */
function getScheduleColorClassDefault(statusId: number): string {
  if (statusId === 199 || statusId === 200 || statusId === 202) return 'bc-event-open';
  if (statusId === 201 || statusId === 205) return 'bc-event-group';
  if ((statusId >= 204 && statusId <= 208) || (statusId >= 700 && statusId <= 708)) return 'bc-event-task';
  if (statusId >= 100 && statusId <= 108) return 'bc-event-inactive';
  return 'bc-event-open';
}

function getLessonColorClass(oneToOneOrGroupId: number): string {
  return oneToOneOrGroupId === 2 ? 'bc-event-lesson-group' : 'bc-event-lesson-1v1';
}

function buildEventContentHtml(
  arg: EventContentArg,
  statusIdToColorClass?: (statusId: number) => string
): { html: string } {
  const { event, timeText, isPast } = arg;
  const ext = (event.extendedProps ?? {}) as Record<string, unknown>;
  const eventType = (ext.eventType as string) || 'schedule';
  const statusId = typeof ext.statusId === 'number' ? ext.statusId : 0;
  const lockedFlag = ext.lockedFlag === true;
  const remark = typeof ext.remark === 'string' && ext.remark.length > 0 ? ext.remark : '';
  // 保证始终有可见文字：空标题时用类型兜底，便于区分「没渲染」和「无文字」
  let title = (event.title ?? '').trim();
  if (!title) {
    if (eventType === 'schedule') title = `Slot ${statusId || ''}`.trim() || '排班';
    else if (eventType === 'lesson') title = 'Lesson';
    else title = eventType === 'ftl' ? 'FTL' : eventType === 'assigned' ? 'Assigned' : 'Slot';
  }

  const scheduleColorClass =
    typeof statusIdToColorClass === 'function'
      ? (statusIdToColorClass(statusId) || 'bc-event-open')
      : getScheduleColorClassDefault(statusId);

  const classes: string[] = ['bc-event-inner', `bc-event-${eventType}`];
  if (eventType === 'schedule') classes.push(scheduleColorClass);
  else if (eventType === 'lesson') classes.push(getLessonColorClass(typeof ext.oneToOneOrGroupId === 'number' ? ext.oneToOneOrGroupId : 1));
  else if (eventType === 'fixed' || eventType === 'ftl' || eventType === 'assigned') classes.push('bc-event-tag');
  if (isPast) classes.push('bc-event-expired');
  if (remark) classes.push('bc-event-has-remark');
  if (lockedFlag) classes.push('bc-event-locked');

  const lockHtml = lockedFlag ? '<span class="bc-event-lock" aria-hidden="true"></span>' : '';
  const titleEscaped = escapeHtml(title);
  const timeHtml = timeText ? `<span class="bc-event-time">${escapeHtml(timeText)}</span>` : '';
  const remarkBadge = remark ? `<span class="bc-event-remark-badge" title="${escapeHtml(remark)}">!</span>` : '';
  const html = `<div class="${classes.join(' ')}" data-event-type="${escapeHtml(eventType)}">${lockHtml}<span class="bc-event-title">${titleEscaped}</span>${timeHtml}${remarkBadge}</div>`;
  return { html };
}

const { t } = useI18n();

const props = withDefaults(defineProps<BusinessCalendarProps>(), {
  initialView: DEFAULT_VIEW,
  businessHours: () => [],
  events: () => [],
  readonly: false,
  config: () => ({}),
  eventContentComponent: undefined,
  contextMenuComponent: undefined,
});

/** 自定义 Slot：el → app 映射，用于 eventWillUnmount 时按需 unmount */
const customEventAppMap = new Map<HTMLElement, ReturnType<typeof createApp>>();

// --- 配置派生 ---
const showHeader = computed(() => props.config?.showHeader !== false);
const singleWeek = computed(() => props.config?.singleWeek === true);
const onlyShowBusinessHours = computed(() => props.config?.onlyShowBusinessHours === true);
const slotDuration = computed(() => props.config?.slotDuration ?? DEFAULT_SLOT_DURATION);
const allowedViews = computed(() => {
  const v = props.config?.allowedViews;
  return v?.length ? v : [...DEFAULT_ALLOWED_VIEWS];
});
const minSelectMinutes = computed(() => {
  const m = props.config?.minSelectMinutes;
  return typeof m === 'number' && m > 0 ? m : DEFAULT_MIN_SELECT_MINUTES;
});

/** 文案：优先 config.i18n，否则 i18n 键 */
const todayLabel = computed(
  () => props.config?.i18n?.today ?? t('components.businessCalendar.today')
);
const headerDatePlaceholder = computed(() =>
  currentViewType.value === 'dayGridMonth'
    ? (props.config?.i18n?.placeholderMonth ?? t('components.businessCalendar.placeholderMonth'))
    : (props.config?.i18n?.placeholderDate ?? t('components.businessCalendar.placeholderDate'))
);

// --- 当前视图类型（由 datesSet 更新，用于 Header 高亮与动态高度）---
const currentViewType = ref<ViewType>(props.initialView);

// 周视图每格高度（px），用于 contentHeight 计算与 CSS 强制行高
const slotHeightCss = computed(() => `${SLOT_HEIGHT_PX}px`);

// --- slotMinTime / slotMaxTime（文档 2.3 onlyShowBusinessHours）---
const slotMinMax = computed(() => {
  if (!onlyShowBusinessHours.value || !props.businessHours?.length) return null;
  return getSlotMinMaxFromBusinessHours(props.businessHours as BusinessHoursSegment[]);
});

const effectiveSlotMinTime = computed(() => slotMinMax.value?.slotMinTime ?? '00:00:00');
const effectiveSlotMaxTime = computed(() => slotMinMax.value?.slotMaxTime ?? '24:00:00');

// --- 周视图 contentHeight（文档 2.3 动态高度）---
const weekContentHeight = computed(() =>
  computeWeekContentHeight(
    effectiveSlotMinTime.value,
    effectiveSlotMaxTime.value,
    slotDuration.value,
    SLOT_HEIGHT_PX
  )
);

const calendarContentHeight = computed<number | 'auto'>(() => {
  return currentViewType.value === 'timeGridWeek' ? weekContentHeight.value : 'auto';
});

// --- FullCalendar 选项（核心计算逻辑）---
const calendarOptions = computed(() => {
  const opts: Record<string, unknown> = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: props.initialView,
    locale: 'zh-cn',
    locales: [zhCnLocale],

    // 不使用自带 toolbar（文档要求自定义 Header）
    headerToolbar: false,

    // 文档 2.1：singleWeek 开启时不显示 nowIndicator，表头更简洁
    nowIndicator: !singleWeek.value,

    // 文档 2.1 选项映射
    slotDuration: slotDuration.value,
    slotMinTime: effectiveSlotMinTime.value,
    slotMaxTime: effectiveSlotMaxTime.value,
    // 时间轴左侧显示 00:00、00:30、01:00…（24 小时，每格都显示时:分）
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      omitZeroMinute: false,
    },
    // 每 30 分钟显示一个时间标签，与 slotDuration 一致
    slotLabelInterval: '00:30:00',
    editable: !props.readonly,
    selectable: !props.readonly,
    allDaySlot: false,
    fixedWeekCount: false,

    // 营业时段高亮与选择约束（文档 2.2 selectConstraint）
    businessHours: props.businessHours?.length ? props.businessHours : undefined,
    selectConstraint: props.businessHours?.length ? 'businessHours' : undefined,

    // 事件源
    events: props.events,

    // 文档 2.4 / 5.8：自定义事件内容；若传入 eventContentComponent 则用该组件渲染，否则用内置 HTML
    eventContent(arg: EventContentArg) {
      const CustomComponent = props.eventContentComponent;
      if (CustomComponent) {
        const el = document.createElement('div');
        el.className = 'bc-custom-event-wrap';
        el.dataset.bcCustomEvent = '1';
        const app = createApp(CustomComponent, { arg });
        app.mount(el);
        customEventAppMap.set(el, app);
        return { domNodes: [el] };
      }
      return buildEventContentHtml(arg, props.config?.statusIdToColorClass);
    },
    eventWillUnmount(arg: { el: HTMLElement }) {
      const wrapper = arg.el?.querySelector?.('[data-bc-custom-event="1"]') as HTMLElement | null;
      if (wrapper) {
        const app = customEventAppMap.get(wrapper);
        if (app) {
          app.unmount();
          customEventAppMap.delete(wrapper);
        }
      }
    },

    // 文档 2.6：在 slot 上直接绑定 contextmenu（FullCalendar 可能阻止冒泡导致父级收不到）
    eventDidMount(arg: { el: HTMLElement; event: { id: string; title?: string; start: Date | null; end: Date | null; extendedProps?: Record<string, unknown> } }) {
      const handler = (e: Event) => {
        const me = e as MouseEvent;
        me.preventDefault();
        me.stopPropagation();
        onSlotContextMenu(me, arg.event);
      };
      arg.el.addEventListener('contextmenu', handler);
    },

    // 文档 2.2 / 6.1：点击与选择
    dateClick: handleDateClick,
    select: handleDateSelect,
    selectAllow: handleEventAllow,
    eventClick: handleEventClick,
    eventAllow: handleEventAllow,
    eventDrop: handleEventDrop,

    // 文档 2.3：月视图 height 用 auto，周视图用计算出的 contentHeight
    height: currentViewType.value === 'dayGridMonth' ? 'auto' : undefined,
    contentHeight: calendarContentHeight.value,

    // 视图/日期变化时更新 currentViewType、标题、头部日期选择器，并便于业务懒加载（文档 2.2 datesSet）
    datesSet(arg: DatesSetArg) {
      currentViewType.value = arg.view.type as ViewType;
      titleText.value = arg.view.title ?? '';
      syncHeaderDateFromRange(arg.start, arg.view.type as ViewType);
      emit('datesSet', arg);
    },
  };

  return opts;
});

// --- Calendar API 引用 ---
const fullCalendarRef = ref<InstanceType<typeof FullCalendar> | null>(null);

function getCalendarApi(): CalendarApi | null {
  const comp = fullCalendarRef.value;
  if (!comp || typeof (comp as { getApi?: () => CalendarApi }).getApi !== 'function') return null;
  return (comp as { getApi: () => CalendarApi }).getApi();
}

// --- 自定义 Header 操作（文档 2.1：调用 Calendar API）---
function onPrev() {
  getCalendarApi()?.prev();
}
function onNext() {
  getCalendarApi()?.next();
}
function onToday() {
  getCalendarApi()?.today();
}
function onChangeView(view: ViewType) {
  getCalendarApi()?.changeView(view);
}

// 当前标题（由 datesSet 回调更新）
const titleText = ref('');

/** 头部日期选择器绑定值（YYYY-MM-DD），与当前视图范围同步 */
const headerDate = ref<string | null>(null);

/** 根据 FullCalendar 当前范围同步头部日期（周视图取周一，月视图取当月 1 日） */
function syncHeaderDateFromRange(start: Date | string | number | null, viewType: ViewType): void {
  if (start == null) {
    headerDate.value = null;
    return;
  }
  const d = new Date(start as Date);
  if (viewType === 'dayGridMonth') {
    headerDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  } else {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    headerDate.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}

/** 头部日期选择器变更：跳转到选中日期/月份并触发 navigate 回调 */
function onHeaderDateChange(val: string | null): void {
  if (!val) return;
  const api = getCalendarApi();
  if (!api) return;
  const dateStr = val.length === 7 ? `${val}-01` : val;
  const d = new Date(dateStr + 'T12:00:00');
  api.gotoDate(d);
  emit('navigate', {
    date: d,
    viewType: currentViewType.value,
    dateStr: val,
  });
}

// 视图/配置变化时触发 updateSize（文档 2.3）
watch(
  [currentViewType, weekContentHeight],
  () => {
    nextTick(() => {
      getCalendarApi()?.updateSize();
    });
  },
  { flush: 'post' }
);

const emit = defineEmits<{
  (e: 'datesSet', arg: DatesSetArg): void;
  (e: 'navigate', payload: NavigatePayload): void;
  (e: 'dateSelect', payload: DateSelectPayload): void;
  (e: 'eventClick', payload: EventClickPayload): void;
  (e: 'eventChange', payload: EventChangePayload): void;
  (e: 'contextMenuAction', payload: ContextMenuActionPayload): void;
}>();

/** 头部日期选择器变更时的回调 payload（辅助数据查询与加载） */
export interface NavigatePayload {
  date: Date;
  viewType: ViewType;
  dateStr: string;
}

/** 文档 2.2 / 6.1：选中范围 payload */
export interface DateSelectPayload {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  allDay: boolean;
  jsEvent: MouseEvent | null;
}

/** 文档 2.2：事件点击 payload（左键详情 / 右键菜单） */
export interface EventClickPayload {
  event: { id: string; title: string; start: Date | null; end: Date | null; extendedProps: Record<string, unknown> };
  jsEvent: MouseEvent;
  isRightClick: boolean;
}

/** 文档 2.2 / 6.1：拖拽变更 payload，由父组件保存后刷新数据 */
export interface EventChangePayload {
  eventId: string;
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  isMove: true;
  startTimeBeforeMove: string;
  endTimeBeforeMove: string;
}

/** 文档 2.6：右键菜单操作 payload */
export interface ContextMenuActionPayload {
  action: ContextMenuAction;
  target: 'slot' | 'event';
  selection?: DateSelectPayload;
  event?: EventClickPayload['event'];
}

export type ContextMenuAction =
  | 'Reserve'
  | 'Active'
  | 'Tasks'
  | 'Inactive'
  | 'Edit'
  | 'Lock'
  | 'Unlock'
  | 'Notes'
  | 'Remove'
  | 'Detail';

/** 将时间对齐到 slotMinutes 粒度（文档 2.2：10:23 → 10:30，slotMinutes=30） */
function alignToSlot(date: Date, slotMinutes: number): Date {
  const d = new Date(date);
  const m = d.getMinutes();
  const aligned = Math.round(m / slotMinutes) * slotMinutes;
  d.setMinutes(aligned, 0, 0);
  if (aligned === 60) {
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
  }
  return d;
}

/** 文档 2.2 dateClick：readonly 返回；对齐到 minSelectMinutes 并触发 select */
function handleDateClick(arg: DateClickArg): void {
  if (props.readonly) return;
  const minutes = minSelectMinutes.value;
  const start = alignToSlot(arg.date, minutes);
  const end = new Date(start.getTime() + minutes * 60 * 1000);
  getCalendarApi()?.select({ start, end });
}

/** 文档 2.2 / 6.1 select：校验时长、跨天、过去时段后 emit */
function handleDateSelect(arg: DateSelectArg): void {
  if (!arg.jsEvent) return;
  const start = arg.start;
  const end = arg.end;
  const durationMs = end.getTime() - start.getTime();
  const durationMinutes = durationMs / (60 * 1000);
  if (durationMinutes < minSelectMinutes.value) return;
  if (start.getDate() !== end.getDate() || start.getMonth() !== end.getMonth() || start.getFullYear() !== end.getFullYear()) return;
  if (end.getTime() < Date.now()) return;
  lastSelection.value = {
    start,
    end,
    startStr: arg.startStr,
    endStr: arg.endStr,
    allDay: arg.allDay,
    jsEvent: arg.jsEvent,
  };
  emit('dateSelect', lastSelection.value);
}

/** 文档 2.2 eventClick：区分左键（详情）与右键（菜单）；6.1 jsEvent 必选；slot 右键可获取 event 属性并显示 Lock/Del 等 */
function handleEventClick(arg: EventClickArg): void {
  if (!arg.jsEvent) return;
  const isRight = arg.jsEvent.button === 2;
  const eventPayload: EventClickPayload['event'] = {
    id: arg.event.id ?? '',
    title: arg.event.title ?? '',
    start: arg.event.start,
    end: arg.event.end,
    extendedProps: (arg.event.extendedProps ?? {}) as Record<string, unknown>,
  };
  if (isRight) {
    contextMenu.value = {
      visible: true,
      x: arg.jsEvent.clientX,
      y: arg.jsEvent.clientY,
      type: 'event',
      event: eventPayload,
    };
  } else {
    emit('eventClick', { event: eventPayload, jsEvent: arg.jsEvent, isRightClick: false });
  }
}

/** 文档 2.2 / 6.1 eventAllow：readonly 禁止拖拽/变更 */
function handleEventAllow(): boolean {
  return !props.readonly;
}

/** 文档 2.2 / 6.1 eventDrop：校验跨天、过去时间，不通过则 revert；通过则 emit 变更请求 */
function handleEventDrop(arg: EventDropArg): void {
  const event = arg.event;
  const start = event.start;
  const end = event.end;
  if (!start || !end) {
    arg.revert();
    return;
  }
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  if (startDay !== endDay) {
    arg.revert();
    return;
  }
  const now = Date.now();
  if (end.getTime() < now) {
    arg.revert();
    return;
  }
  const oldEvent = arg.oldEvent;
  const oldStart = oldEvent.start;
  const oldEnd = oldEvent.end;
  emit('eventChange', {
    eventId: String(event.id),
    start,
    end,
    startStr: event.startStr ?? start.toISOString(),
    endStr: event.endStr ?? end.toISOString(),
    isMove: true,
    startTimeBeforeMove: oldStart ? new Date(oldStart).toISOString().slice(0, 19).replace('T', ' ') : '',
    endTimeBeforeMove: oldEnd ? new Date(oldEnd).toISOString().slice(0, 19).replace('T', ' ') : '',
  });
}

/** 文档 2.6 右键菜单：空白处 vs 事件、Locked vs Unlocked 决定菜单项；2.6.1 slot 组件右键同空白处显示 slot 菜单 */
const contextMenu = ref<{
  visible: boolean;
  x: number;
  y: number;
  type: 'blank' | 'event';
  event?: EventClickPayload['event'];
  /** 当 type 为 blank 时，从事件块右键来的 selection（事件时间范围），否则用 lastSelection */
  selection?: DateSelectPayload | null;
}>({ visible: false, x: 0, y: 0, type: 'blank' });

const lastSelection = ref<DateSelectPayload | null>(null);

/** 右键菜单的 selection：优先 contextMenu.selection（事件块右键），否则 lastSelection（空白处框选后右键） */
const contextMenuSelection = computed(() =>
  contextMenu.value.type === 'blank' ? (contextMenu.value.selection ?? lastSelection.value) : undefined
);

function getContextMenuLabel(action: ContextMenuAction): string {
  const overrides = props.config?.i18n?.contextMenu;
  const key = overrides?.[action];
  if (key) return key;
  return t(`components.businessCalendar.contextMenu.${action.toLowerCase()}`);
}

const contextMenuItems = computed(() => {
  if (contextMenu.value.type === 'blank') {
    return [
      { action: 'Active' as const, label: getContextMenuLabel('Active'), disabled: false },
      { action: 'Tasks' as const, label: getContextMenuLabel('Tasks'), disabled: false },
      { action: 'Inactive' as const, label: getContextMenuLabel('Inactive'), disabled: false },
    ];
  }
  const ev = contextMenu.value.event;
  if (!ev) return [];
  const ext = ev.extendedProps ?? {};
  const eventType = (ext.eventType as string) || 'schedule';
  const locked = ext.lockedFlag === true;
  if (eventType === 'lesson') {
    return [{ action: 'Detail' as const, label: getContextMenuLabel('Detail'), disabled: false }];
  }
  if (eventType === 'schedule') {
    if (locked) {
      return [{ action: 'Unlock' as const, label: getContextMenuLabel('Unlock'), disabled: false }];
    }
    return [
      { action: 'Reserve' as const, label: getContextMenuLabel('Reserve'), disabled: false },
      { action: 'Edit' as const, label: getContextMenuLabel('Edit'), disabled: false },
      { action: 'Lock' as const, label: getContextMenuLabel('Lock'), disabled: false },
      { action: 'Notes' as const, label: getContextMenuLabel('Notes'), disabled: false },
      { action: 'Remove' as const, label: getContextMenuLabel('Remove'), disabled: false },
    ];
  }
  return [];
});

/** 由 eventDidMount 绑定的 slot 右键直接调用，因 FullCalendar 可能阻止 contextmenu 冒泡 */
function onSlotContextMenu(
  e: MouseEvent,
  eventObj: { id: string; title?: string; start: Date | null; end: Date | null; extendedProps?: Record<string, unknown> }
): void {
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    type: 'event',
    event: {
      id: eventObj.id ?? '',
      title: eventObj.title ?? '',
      start: eventObj.start,
      end: eventObj.end,
      extendedProps: (eventObj.extendedProps ?? {}) as Record<string, unknown>,
    },
  };
}

function onCalendarContextMenu(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  const eventEl = target.closest('.fc-event');
  if (eventEl) {
    // 若 eventDidMount 已绑定，此处通常不会触发（因 stopPropagation）；兜底逻辑保留
    const eventId = (eventEl as HTMLElement).dataset.eventId;
    const api = getCalendarApi();
    const eventObj = eventId ? api?.getEventById(eventId) : null;
    if (eventObj) {
      contextMenu.value = {
        visible: true,
        x: e.clientX,
        y: e.clientY,
        type: 'event',
        event: {
          id: eventObj.id ?? '',
          title: eventObj.title ?? '',
          start: eventObj.start,
          end: eventObj.end,
          extendedProps: (eventObj.extendedProps ?? {}) as Record<string, unknown>,
        },
      };
    }
  } else if (lastSelection.value) {
    contextMenu.value = {
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'blank',
    };
  }
}

function onContextMenuAction(action: ContextMenuAction): void {
  const sel = contextMenuSelection.value;
  const payload: ContextMenuActionPayload = {
    action,
    target: contextMenu.value.type === 'event' ? 'event' : 'slot',
    ...(contextMenu.value.type === 'blank' && sel && { selection: sel }),
    ...(contextMenu.value.type === 'event' && contextMenu.value.event && { event: contextMenu.value.event }),
  };
  emit('contextMenuAction', payload);
  contextMenu.value = { ...contextMenu.value, visible: false };
  getCalendarApi()?.unselect();
}

function closeContextMenu(): void {
  contextMenu.value = { ...contextMenu.value, visible: false };
}

onMounted(() => {
  globalThis.addEventListener('click', closeContextMenu);
});
onUnmounted(() => {
  globalThis.removeEventListener('click', closeContextMenu);
  customEventAppMap.forEach((app) => app.unmount());
  customEventAppMap.clear();
});

function viewLabel(view: ViewType): string {
  const i18nConf = props.config?.i18n;
  if (view === 'dayGridMonth') return i18nConf?.viewMonth ?? t('components.businessCalendar.viewMonth');
  return i18nConf?.viewWeek ?? t('components.businessCalendar.viewWeek');
}

// 暴露 API 供父组件使用
defineExpose({
  getApi: getCalendarApi,
});
</script>

<style lang="scss" scoped>
.business-calendar__fc {
  min-height: 200px;
}

/* 全局与主题变量（文档 2.3 businessHours 背景高亮） */
:deep(.fc) {
  --fc-border-color: var(--el-border-color);
  --fc-page-bg-color: var(--el-bg-color);
  --fc-neutral-bg-color: var(--el-fill-color-light);
  --fc-today-bg-color: var(--el-color-primary-light-9);
  /* 营业时段背景高亮（文档 2.4 / 5.8） */
  --fc-bg-event-opacity: 0.15;
}

/* 营业时段区域：非营业时间可弱化（FullCalendar 通过 businessHours 渲染背景） */
:deep(.fc .fc-bg-event) {
  opacity: var(--fc-bg-event-opacity);
}

/* 周视图：强制每个时间格行高，保证 slot 内容能完整显示（由 --bc-slot-height 控制） */
:deep(.fc-timegrid-slots table tbody tr),
:deep(.fc-timegrid-axis-chunk table tbody tr) {
  height: var(--bc-slot-height, 80px) !important;
  min-height: var(--bc-slot-height, 80px) !important;
}

/* ========== 事件内容容器（文档 2.4 eventContent） ========== */
:deep(.fc-event .fc-event-main) {
  overflow: hidden;
}

/* 自定义 Slot 组件挂载的容器，填满事件块区域 */
:deep(.bc-custom-event-wrap) {
  height: 100%;
  min-height: inherit;
  display: flex;
  align-items: stretch;
}

/* 保证事件块有最小高度和可见背景，便于确认 slot 是否渲染 */
:deep(.fc-event) {
  min-height: 24px;
  border-width: 1px;
  border-style: solid;
}

:deep(.bc-event-inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.bc-event-title) {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.bc-event-time) {
  flex-shrink: 0;
  opacity: 0.9;
  font-size: 11px;
}

/* ========== Schedule：按 statusId 颜色（文档 5.2 / 5.8，兼顾对比度） ========== */
:deep(.bc-event-schedule.bc-event-open) {
  background-color: #16a34a;
  border-color: #15803d;
  color: #f0fdf4;
}
:deep(.bc-event-schedule.bc-event-group) {
  background-color: #2563eb;
  border-color: #1d4ed8;
  color: #eff6ff;
}
:deep(.bc-event-schedule.bc-event-task) {
  background-color: #facc15;
  border-color: #ca8a04;
  color: #422006;
}
:deep(.bc-event-schedule.bc-event-inactive) {
  background-color: #6b7280;
  border-color: #4b5563;
  color: #f9fafb;
}

/* ========== Lesson：1v1 绿 / Group 蓝（文档 5.3 / 5.8） ========== */
:deep(.bc-event-lesson.bc-event-lesson-1v1) {
  background-color: #16a34a;
  border-color: #15803d;
  color: #f0fdf4;
}
:deep(.bc-event-lesson.bc-event-lesson-group) {
  background-color: #2563eb;
  border-color: #1d4ed8;
  color: #eff6ff;
}

/* ========== Fixed / FTL / Assigned 标签（文档 5.4 / 5.8） ========== */
:deep(.bc-event-fixed.bc-event-tag),
:deep(.bc-event-ftl.bc-event-tag),
:deep(.bc-event-assigned.bc-event-tag) {
  background-color: #16a34a;
  border-color: #15803d;
  color: #f0fdf4;
  font-weight: 500;
}

/* ========== 状态标识（文档 2.4 / 5.8） ========== */
/* 锁定：锁图标 */
:deep(.bc-event-lock) {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  background: currentColor;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z'/%3E%3Crect x='7' y='11' width='10' height='5' rx='1'/%3E%3C/svg%3E") center/contain no-repeat;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z'/%3E%3Crect x='7' y='11' width='10' height='5' rx='1'/%3E%3C/svg%3E") center/contain no-repeat;
  opacity: 0.95;
}

/* 过期态：半透明 */
:deep(.bc-event-expired) {
  opacity: 0.6;
}

/* 备注角标 */
:deep(.bc-event-remark-badge) {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  font-size: 10px;
  font-weight: 700;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 4px;
}

/* 暗色主题下事件对比度微调 */
:deep(.dark .bc-event-schedule.bc-event-task) {
  color: #422006;
}
</style>
