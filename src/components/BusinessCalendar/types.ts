/**
 * 业务日历组件类型定义
 * 依据 FullCalendar 业务规格文档 1.2、2.1、2.3
 */

import type { Component } from 'vue';
import type { EventInput } from '@fullcalendar/core';

/** 营业时段单段：周几 + 开始/结束时间 */
export interface BusinessHoursSegment {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

/** 组件 config 配置（文档 2.1、3.2） */
export interface BusinessCalendarConfig {
  /** 是否显示自定义 Header，默认 true */
  showHeader?: boolean;
  /** singleWeek 模式：关闭时显示 nowIndicator 与完整表头，开启时更简洁、不显示 nowIndicator */
  singleWeek?: boolean;
  /** 为 true 时由 businessHours 计算 slotMinTime/slotMaxTime，只显示营业时段范围 */
  onlyShowBusinessHours?: boolean;
  /** 时间格粒度，如 '00:30:00' */
  slotDuration?: string;
  /** 允许的视图列表，用于 Header 视图切换按钮 */
  allowedViews?: ViewType[];
  /**
   * 可选。自定义 schedule 的 statusId → CSS 类名映射（如 bc-event-open、bc-event-group）。
   * 传入后覆盖内置默认映射；返回空字符串时使用默认 bc-event-open。
   */
  statusIdToColorClass?: (statusId: number) => string;
  /**
   * 空白处选择时的最小时长（分钟），默认 30。
   * 用于 dateClick 对齐与 dateSelect 校验。
   */
  minSelectMinutes?: number;
  /**
   * 可选。文案覆盖，用于自定义或未接入 i18n 时传入固定文案。
   * 未传入的字段使用 components.businessCalendar 下的 i18n 键。
   */
  i18n?: {
    viewMonth?: string;
    viewWeek?: string;
    today?: string;
    placeholderMonth?: string;
    placeholderDate?: string;
    contextMenu?: Partial<Record<ContextMenuActionType, string> & { close?: string }>;
  };
}

/** 支持的视图类型（文档 1.2：月视图、周视图） */
export type ViewType = 'dayGridMonth' | 'timeGridWeek';

/** 组件 Props */
export interface BusinessCalendarProps {
  /** 初始视图 */
  initialView?: ViewType;
  /** 营业时段，用于高亮与可选范围；onlyShowBusinessHours 时用于计算 slot 范围 */
  businessHours?: BusinessHoursSegment[];
  /** 日历事件列表 */
  events?: EventInput[];
  /** 只读模式：禁止拖拽、选择、编辑 */
  readonly?: boolean;
  /** 配置：header、singleWeek、onlyShowBusinessHours、slotDuration、allowedViews */
  config?: BusinessCalendarConfig;
  /**
   * 自定义 Slot（事件块）组件：传入 Vue 组件后，每个日历事件将用该组件渲染。
   * 组件接收 props: { arg: EventContentArg }，arg 含 event、timeText、isPast、view 等（见 FullCalendar EventContentArg）。
   * 不传则使用内置默认渲染。
   */
  eventContentComponent?: Component;
  /**
   * 自定义右键菜单组件：传入 Vue 组件后，右键点击空白或事件时用该组件渲染菜单。
   * 组件接收 props: visible, x, y, target, selection?, event?, items；并 emit：action(action)、close()。
   * 不传则使用内置默认菜单。
   */
  contextMenuComponent?: Component;
}

export const DEFAULT_VIEW: ViewType = 'dayGridMonth';
export const DEFAULT_SLOT_DURATION = '00:30:00';
export const DEFAULT_ALLOWED_VIEWS: ViewType[] = ['dayGridMonth', 'timeGridWeek'];
/** 空白处选择的最小时长（分钟），默认 30 */
export const DEFAULT_MIN_SELECT_MINUTES = 30;

/** 周视图下每格高度（px），用于动态计算 contentHeight，保证 slot 内容完整显示 */
export const SLOT_HEIGHT_PX = 80;

/** 自定义右键菜单组件可用的 action 类型（与 emit 的 contextMenuAction 一致） */
export type ContextMenuActionType =
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

/**
 * 自定义右键菜单组件接收的 props（用于 contextMenuComponent）
 * 组件需 emit：action(action: ContextMenuActionType)、close()
 */
export interface ContextMenuSlotProps {
  visible: boolean;
  x: number;
  y: number;
  target: 'slot' | 'event';
  /** 点击空白时存在，为当前选中的时间范围 */
  selection?: {
    start: Date;
    end: Date;
    startStr: string;
    endStr: string;
    allDay: boolean;
    jsEvent: MouseEvent | null;
  };
  /** 点击事件时存在，为当前事件信息 */
  event?: {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    extendedProps: Record<string, unknown>;
  };
  /** 内置计算好的菜单项（可直接渲染或自绘）；action 为 ContextMenuActionType */
  items: { action: ContextMenuActionType; label: string; disabled: boolean }[];
}
