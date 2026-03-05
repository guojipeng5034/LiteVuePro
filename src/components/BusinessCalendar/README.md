# BusinessCalendar 组件文档

**BusinessCalendar** 是基于 FullCalendar v6 的业务日历组件，按《FullCalendar 组件业务规格文档》实现。本文档分为 **功能说明书**（业务使用）与 **开发规范**（维护与扩展）。

---

## 目录

### 一、功能说明书

- [1 组件概述](#一组件概述)
- [2 能力总览与自定义入口](#二能力总览与自定义入口)
- [3 按场景使用说明](#三按场景使用说明)
- [4 Props 与 Config](#四props-与-config-说明)
- [5 事件与回调](#五事件emit与操作回调)
- [6 数据准备与转换](#六数据准备与转换)
- [7 最小接入示例](#七最小接入示例)
- [8 自定义说明与能力使用方法](#八自定义说明与能力使用方法)
- [9 注意事项](#九注意事项)

### 二、开发规范

- [10 文件结构与职责](#十文件结构与职责)
- [11 类型与导出约定](#十一类型与导出约定)
- [12 主题与暗色模式](#十二主题与暗色模式)
- [13 国际化](#十三国际化)
- [14 扩展与修改自检清单](#十四扩展与修改自检清单)

---

## 一、组件概述

### 1.1 是什么

`BusinessCalendar` 提供：

- **月视图**（dayGridMonth）、**周视图**（timeGridWeek）
- 自定义头部：上一/下一、今天、视图切换
- 营业时段高亮、时间格粒度（如 30 分钟）可配
- 多种事件类型：排班（schedule）、课程（lesson）、FTL/Assigned 等
- 只读 / 可编辑模式、右键菜单、选择与拖拽

### 1.2 适用场景总览

| 场景           | 核心能力                     | 默认视图 | 是否可编辑 | 数据来源说明           |
|----------------|------------------------------|----------|------------|------------------------|
| 教师排班       | 时段管理、课程预约、状态切换 | 周为主   | 是         | 教师 ID + 日期范围     |
| 学生日程       | 查看个人课程                 | 月 + 周  | 否         | 学生 ID + 日期范围     |
| 线下申请人日程 | 查看申请人课程               | 月 + 周  | 否         | 申请人 ID + 日期范围   |
| 基础排班       | 批量创建、时段增删改         | 周       | 是         | 配置 ID + businessHours |
| 日程演示       | 示例、模式切换               | 月 + 周  | 可选       | 本地示例数据           |

---

## 二、能力总览与自定义入口

### 2.1 能力一览

| 能力 | 说明 | 使用方式 |
|------|------|----------|
| 月/周视图 | dayGridMonth、timeGridWeek，可切换 | `config.allowedViews`、`initialView` |
| 自定义头部 | 上一/下一、今天、视图切换、**日期选择器** | `config.showHeader`；日期选择会触发 `navigate` + `dates-set` |
| 营业时段 | 高亮、可选范围约束、仅显示营业时段 | `businessHours`、`config.onlyShowBusinessHours` |
| 时间格粒度 | 如 30 分钟一格，00:00–24:00 可配 | `config.slotDuration`、`config.onlyShowBusinessHours` |
| 事件类型 | schedule / lesson / ftl / assigned / fixed | 通过 `events` 的 `extendedProps.eventType` 等，见 §5、§六 |
| 只读/可编辑 | 禁止或允许选择、拖拽、缩放 | `readonly` |
| **自定义事件块** | 用自定义 Vue 组件渲染每个 slot | **`eventContentComponent`**，见 §八.2 |
| **自定义右键菜单** | 用自定义 Vue 组件渲染右键菜单 | **`contextMenuComponent`**，见 §八.3 |
| 选择空白 | 框选 30 分钟等 | `@date-select` |
| 点击事件 | 左键详情；**右键 slot（事件块）** 显示 event 菜单（Lock/Remove 等），可获取 slot 属性 | `@event-click` |
| 拖拽改时间 | 保存后刷新 | `@event-change` |
| 视图/范围变化 | 懒加载、按范围查数据 | `@dates-set` |
| 日期选择器选择 | 按选中日期/月份查数据 | `@navigate`、`@dates-set` |
| 右键菜单选择项 | 事件块：Lock/Remove 等；空白处：Active/Tasks/Inactive | `@context-menu-action` |

### 2.2 能力使用方法速查

| 想实现的效果 | 使用的 Prop / 事件 / 配置 | 详见 |
|--------------|---------------------------|------|
| 按视图范围懒加载数据 | 监听 `@dates-set`，用 `startStr`/`endStr` 请求接口并更新 `events` | §五 |
| 用户选了某日期/月份后查数据 | 监听 `@navigate` 或等 `@dates-set` 后以新范围查数据 | §五 |
| 每个事件块完全自己画（样式+结构） | 传入 **`eventContentComponent`**（Vue 组件，接收 `arg: EventContentArg`） | §八.3 |
| 右键菜单完全自己画（样式+结构） | 传入 **`contextMenuComponent`**（Vue 组件，接收 ContextMenuSlotProps，emit `action`/`close`） | §八.4 |
| 只改事件块颜色/字体，不换结构 | 用 CSS 覆盖 `.bc-event-*` 等类名 | §八.2 |
| 不改组件，只改事件文案/状态展示 | 在构造 `events` 时设置 `title`、`extendedProps`（eventType、statusId、lockedFlag、remark 等） | §八.1 |
| 禁止拖拽与选择 | `readonly: true` | §四 |
| 只显示营业时段时间轴 | `config.onlyShowBusinessHours: true` + `businessHours` | §四、§六 |

---

## 三、按场景使用说明

### 3.1 教师排班

**用途**：教师查看与编辑自己的排班、已预约课程、FTL/Assigned 等。

**要点**：

- 以**周视图**为主，可切换月视图。
- 需做 **Slot 拆分**：schedule 与 lesson、ftl、assigned 重叠时，schedule 被拆成多段，避免重叠显示。
- 数据：排班 API（schedule）、课程 API（lesson）、FTL/Assigned API → 经 `useCalendarData.buildEventsFromSchedulesAndBlockers` 转换后传入 `events`。

**推荐配置示例**：

```ts
const calendarConfig = {
  showHeader: true,
  singleWeek: false,
  onlyShowBusinessHours: false,  // 或 true，只显示营业时段
  slotDuration: '00:30:00',
  allowedViews: ['dayGridMonth', 'timeGridWeek'],
};
```

**营业时段**：用 `parseBusinessHoursString('(Mon-Fri)09:00-18:00&&(Sat)10:00-16:00')` 得到 `businessHours` 传入。

**需监听的事件**：

- `@dates-set`：懒加载，用 `startStr`/`endStr` 按教师 ID 拉取排班与课程。
- `@date-select`：选中 30 分钟空白后，可弹出菜单（Active/Tasks/Inactive 等，无 Reserve）。
- `@event-click`：lesson → 打开课程详情；schedule → 可配合右键菜单（Reserve/Edit/Lock/Notes/Remove 等）。
- `@event-change`：拖拽结束后，调用排班保存 API 并刷新数据。
- `@context-menu-action`：根据 action（Reserve、Edit、Lock、Notes、Remove 等）打开对应弹窗。

**事件类型**：schedule、lesson、ftl、assigned、fixed（见规格文档 5.1）。

---

### 3.2 学生日程

**用途**：学生查看自己的课程安排，只读。

**要点**：月视图 + 周视图均可；`readonly: true`；事件形态为「学生课程」。需监听 `@dates-set`（拉取课程）、`@event-click`（打开详情）。

---

### 3.3 线下申请人日程

**用途**：查看线下申请人的课程安排，只读。与学生日程类似，数据按申请人 ID + 日期范围拉取。

---

### 3.4 基础排班

**用途**：按配置批量创建、增删改排班时段，无课程预约。

**要点**：以周视图为主，可编辑；无 lesson/ftl/assigned，可不做 Slot 拆分。需监听 `@dates-set`、`@date-select`（禁止跨天）、`@event-change`、`@context-menu-action`。

---

### 3.5 日程演示

**用途**：Demo、示例、模式切换演示。月 + 周视图，`readonly` 可切换，`events` 使用本地模拟数据。

---

## 四、Props 与 Config 说明

### 4.1 Props

| 属性            | 类型                    | 说明 |
|-----------------|-------------------------|------|
| `initialView`   | `'dayGridMonth' \| 'timeGridWeek'` | 初始视图，默认月视图 |
| `businessHours` | `BusinessHoursSegment[]` | 营业时段，用于高亮与可选范围；仅当 `config.onlyShowBusinessHours === true` 时用于限制时间轴范围 |
| `events`        | `EventInput[]`          | 日历事件列表（FullCalendar 格式，含 start/end 及 extendedProps） |
| `readonly`      | `boolean`               | 只读：禁止拖拽、选择、编辑 |
| `config`        | `BusinessCalendarConfig`| 见下表 |
| `eventContentComponent` | `Component`        | 可选。自定义 Slot 组件，接收 props `{ arg: EventContentArg }`；不传则使用内置默认渲染 |
| `contextMenuComponent`  | `Component`        | 可选。自定义右键菜单组件，接收 props（见 7.4），emit `action`、`close`；不传则使用内置菜单 |

### 4.2 config 配置项

| 配置项                 | 类型        | 说明 |
|------------------------|-------------|------|
| `showHeader`           | `boolean`   | 是否显示自定义 Header，默认 true |
| `singleWeek`          | `boolean`   | 为 true 时表头更简洁、不显示当前时间线 |
| `onlyShowBusinessHours` | `boolean` | 为 true 时由 businessHours 计算 slotMinTime/slotMaxTime，只显示营业时段 |
| `slotDuration`        | `string`    | 时间格粒度，如 `'00:30:00'`（30 分钟一格） |
| `allowedViews`        | `ViewType[]`| 允许的视图，如 `['dayGridMonth', 'timeGridWeek']`，用于 Header 切换按钮 |
| `statusIdToColorClass` | `(statusId: number) => string` | 可选。自定义 schedule 的 statusId → CSS 类名（如 bc-event-open、bc-event-group）映射；不传则用内置默认 |
| `minSelectMinutes`    | `number`    | 空白处选择的最小时长（分钟），默认 30；用于 dateClick 对齐与 dateSelect 校验 |
| `i18n`                | `object`    | 可选。文案覆盖；未传入的字段使用 `components.businessCalendar` i18n 键。支持：viewMonth、viewWeek、today、placeholderMonth、placeholderDate、contextMenu（各 action 及 close） |

---

## 五、事件（emit）与操作回调

所有表格（日历）相关操作均配有回调，便于做数据查询与加载。

### 5.1 事件列表

| 事件名               | 说明 |
|----------------------|------|
| `dates-set`          | **视图日期范围变化**（上一/下一、今天、切换视图、头部日期选择器选择后都会触发），携带 `startStr`、`endStr`、`view`，用于懒加载与数据拉取 |
| `navigate`           | **头部日期选择器选择日期/月份**时触发，携带 `date`、`viewType`、`dateStr`，可在此或配合 `dates-set` 做查询 |
| `date-select`        | 用户在空白处选中一段日期时间（如 30 分钟），可用来创建新 slot 或弹菜单 |
| `event-click`        | 点击某个事件（左键），可区分 eventType 打开详情 |
| `event-change`       | 拖拽或缩放导致事件时间变更，需在业务层保存后刷新 events |
| `context-menu-action`| 右键菜单选择了某一项，携带 action、target（slot/event）、selection（空白处）或 event（事件块） |

### 5.2 操作与回调一览

| 用户操作           | 触发的回调 | 用途建议 |
|--------------------|------------|----------|
| 点击「上一」/「下一」 | `dates-set` | 用 `startStr`/`endStr` 拉取该范围数据 |
| 点击「今天」       | `dates-set` | 同上 |
| 切换「月」/「周」视图 | `dates-set` | 同上 |
| **头部日期选择器选择日期或月份** | `navigate` + `dates-set` | 用 `navigate.dateStr` 或 `dates-set.startStr/endStr` 查询并加载 |
| 在空白处框选一段时间 | `date-select` | 创建 slot、打开菜单等 |
| 点击某个事件（左键） | `event-click` | 打开详情 |
| 右键事件块（slot）   | 弹出 event 菜单 | `context-menu-action`，`target='event'`，`event` 含 id/title/start/end/extendedProps，可做 Lock/Remove |
| 右键空白处（需先框选） | 弹出 slot 菜单 | `context-menu-action`，`target='slot'`，`selection` 为框选时间范围 |
| 拖拽事件改变时间   | `event-change` | 保存新时间并刷新列表 |

**数据加载建议**：以 `dates-set` 为统一入口做懒加载（根据 `startStr`、`endStr` 请求接口并更新 `events`）；需要「用户主动选了哪一天」时再监听 `navigate`。

---

## 六、数据准备与转换

### 6.1 营业时段格式

- **组件所需**：`BusinessHoursSegment[]`，每项 `{ daysOfWeek: number[], startTime: string, endTime: string }`。
- **字符串解析**：使用 `useCalendarData().parseBusinessHoursString`：

```ts
import { useCalendarData } from '@/composables/useCalendarData';
const { parseBusinessHoursString } = useCalendarData();
const businessHours = parseBusinessHoursString('(Mon-Fri)09:00-18:00&&(Sat)10:00-16:00');
```

- `daysOfWeek`：0=周日、1=周一 … 6=周六。

### 6.2 教师排班：从业务数据到 events

将「排班 + 课程 + FTL + Assigned」转为 FullCalendar 的 `events`，并做 Slot 拆分：

```ts
import { useCalendarData } from '@/composables/useCalendarData';
import type { ScheduleSlot, Lesson, BlockingSlot } from '@/composables/useCalendarData';

const { buildEventsFromSchedulesAndBlockers } = useCalendarData();

const schedules: ScheduleSlot[] = []; // id, startTime, endTime, statusId, lockedFlag, remark...
const lessons: Lesson[] = [];
const ftl: BlockingSlot[] = [];
const assigned: BlockingSlot[] = [];

const calendarEvents = computed(() =>
  buildEventsFromSchedulesAndBlockers(schedules, lessons, ftl, assigned)
);
```

- **ScheduleSlot**：至少 `id`、`startTime`、`endTime`、`statusId`，可选 `lockedFlag`、`remark`。时间可为 ISO 或 `YYYY-MM-DD HH:mm:ss`（组件内会转为 ISO）。
- **Lesson / BlockingSlot**：至少 `startTime`、`endTime`，用于与 schedule 做重叠拆分。

### 6.3 事件类型与展示（eventType）

| eventType | 含义     | 可拖拽 | 可编辑 | 说明 |
|-----------|----------|--------|--------|------|
| schedule  | 排班时段 | 是*    | 是*    | *非锁定时；按 statusId 显示 Open/Group/Task/Inactive 等 |
| lesson    | 已预约课程 | 否   | 否     | 1v1/Group，点击可开课程详情 |
| fixed     | 固定课时 | 否     | 否     | 固定课标签 |
| ftl       | FTL 时段 | 否     | 否     | 参与拆分 schedule |
| assigned  | 已分配时段 | 否   | 否     | 参与拆分 schedule |

### 6.4 月视图 / 周视图与两种业务 JSON 数据结构

月视图（dayGridMonth）与周视图（timeGridWeek）**共用同一套 `events` 数据结构**，仅展示形态不同；按 `@dates-set` 的 `startStr`/`endStr` 区分请求范围（整月或单周）。下面给出组件接收的 **events** 格式，以及两种业务（教师排班、学生日程）的**输入 JSON** 与**转换后 events 示例**。

#### 6.4.1 组件接收的 events（月视图与周视图统一）

组件 Props `events` 类型为 `EventInput[]`（FullCalendar 标准 + 业务扩展）。单条事件结构：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识 |
| `title` | `string` | 是 | 展示标题 |
| `start` | `string` | 是 | 开始时间，ISO8601 或 `YYYY-MM-DDTHH:mm:ss` |
| `end` | `string` | 是 | 结束时间，同上 |
| `editable` | `boolean` | 否 | 是否可编辑，默认由 eventType 决定 |
| `draggable` | `boolean` | 否 | 是否可拖拽 |
| `className` | `string` | 否 | 样式类名（如 `fc-event-schedule`、`fc-event-lesson`） |
| `extendedProps` | `object` | 否 | 见下表 |

**extendedProps 常用字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `eventType` | `'schedule' \| 'lesson' \| 'ftl' \| 'assigned' \| 'fixed'` | 事件类型 |
| `statusId` | `number` | 排班状态（199=Reserve, 200=Open, 201=Group 等） |
| `lockedFlag` | `boolean` | 是否锁定 |
| `remark` | `string` | 备注 |
| `originalId` | `string \| number` | 拆分后片段对应的原 schedule id |
| `segmentIndex` | `number` | 片段序号 |
| `oneToOneOrGroupId` | `number` | 课程 1v1(1) / 团体(2) |
| `curriculumOriginalName` | `string` | 课程名称 |

**events 数组示例（月/周视图通用）：**

```json
[
  {
    "id": "s1",
    "title": "Open",
    "start": "2025-02-03T09:00:00",
    "end": "2025-02-03T12:00:00",
    "editable": true,
    "draggable": true,
    "className": "fc-event-schedule bc-event-open",
    "extendedProps": {
      "eventType": "schedule",
      "statusId": 200,
      "lockedFlag": false,
      "remark": "可预约"
    }
  },
  {
    "id": "lesson_101",
    "title": "English 1v1",
    "start": "2025-02-03T10:00:00",
    "end": "2025-02-03T10:30:00",
    "editable": false,
    "draggable": false,
    "className": "fc-event-lesson",
    "extendedProps": {
      "eventType": "lesson",
      "statusId": null,
      "oneToOneOrGroupId": 1,
      "curriculumOriginalName": "English 1v1",
      "studentFullName": "Student A"
    }
  },
  {
    "id": "ftl_1",
    "title": "FTL",
    "start": "2025-02-04T14:00:00",
    "end": "2025-02-04T16:00:00",
    "editable": false,
    "draggable": false,
    "className": "fc-event-ftl",
    "extendedProps": { "eventType": "ftl" }
  }
]
```

---

#### 6.4.2 业务一：教师排班（月视图 / 周视图 输入 JSON）

教师排班需接口返回：**排班（schedules）**、**课程（lessons）**、**FTL**、**Assigned** 四类数据，经 `buildEventsFromSchedulesAndBlockers` 转成上述 `events`。

**排班 ScheduleSlot（单条）：**

```json
{
  "id": "s1",
  "startTime": "2025-02-03 09:00:00",
  "endTime": "2025-02-03 12:00:00",
  "statusId": 200,
  "lockedFlag": false,
  "remark": "可预约"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string \| number` | 是 | 排班 id |
| `startTime` | `string` | 是 | `YYYY-MM-DD HH:mm:ss` 或 ISO |
| `endTime` | `string` | 是 | 同上 |
| `statusId` | `number` | 是 | 199/200/201/202/204–208/100 等 |
| `lockedFlag` | `boolean` | 否 | 是否锁定 |
| `remark` | `string` | 否 | 备注 |

**课程 Lesson（单条）：**

```json
{
  "id": "101",
  "startTime": "2025-02-03 10:00:00",
  "endTime": "2025-02-03 10:30:00",
  "curriculumOriginalName": "English 1v1",
  "curriculum": "English 1v1",
  "studentFullName": "Student A",
  "siteName": "Site A",
  "oneToOneOrGroupId": 1
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string \| number` | 是 | 课程 id |
| `startTime` / `endTime` | `string` | 是 | 时间范围 |
| `curriculumOriginalName` / `curriculum` | `string` | 否 | 课程名，用于 title |
| `studentFullName` | `string` | 否 | 学生姓名 |
| `oneToOneOrGroupId` | `number` | 否 | 1=1v1，2=团体 |

**FTL / Assigned BlockingSlot（单条）：**

```json
{
  "id": "ftl-1",
  "startTime": "2025-02-04 14:00:00",
  "endTime": "2025-02-04 16:00:00"
}
```

**教师排班 · 周视图范围示例（一周输入）：**

```json
{
  "schedules": [
    { "id": "s1", "startTime": "2025-02-03 09:00:00", "endTime": "2025-02-03 12:00:00", "statusId": 200, "lockedFlag": false },
    { "id": "s2", "startTime": "2025-02-03 14:00:00", "endTime": "2025-02-03 18:00:00", "statusId": 199, "lockedFlag": false }
  ],
  "lessons": [
    { "id": "l1", "startTime": "2025-02-03 10:00:00", "endTime": "2025-02-03 10:30:00", "curriculumOriginalName": "English 1v1", "oneToOneOrGroupId": 1 }
  ],
  "ftl": [
    { "id": "ftl1", "startTime": "2025-02-04 14:00:00", "endTime": "2025-02-04 16:00:00" }
  ],
  "assigned": [
    { "id": "a1", "startTime": "2025-02-05 12:00:00", "endTime": "2025-02-05 13:00:00" }
  ]
}
```

**教师排班 · 月视图范围示例（整月输入，仅列少量项）：**

```json
{
  "schedules": [
    { "id": "s-1", "startTime": "2025-02-01 09:00:00", "endTime": "2025-02-01 12:00:00", "statusId": 200 },
    { "id": "s-2", "startTime": "2025-02-15 14:00:00", "endTime": "2025-02-15 18:00:00", "statusId": 199 }
  ],
  "lessons": [
    { "id": "l-1", "startTime": "2025-02-01 10:00:00", "endTime": "2025-02-01 10:30:00", "curriculumOriginalName": "Math 1v1", "oneToOneOrGroupId": 1 }
  ],
  "ftl": [],
  "assigned": []
}
```

后端按 `dates-set` 的 `startStr`/`endStr` 返回对应时间段内的 schedules、lessons、ftl、assigned 即可；前端用 `buildEventsFromSchedulesAndBlockers(schedules, lessons, ftl, assigned)` 得到 `events` 传给组件。

---

#### 6.4.3 业务二：学生日程（月视图 / 周视图 输入 JSON）

学生日程为**只读课程表**，仅需**课程（lessons）**列表，无需排班与 FTL/Assigned。月视图请求整月课程，周视图请求当周课程。

**学生日程 · 输入 JSON 示例（周视图范围）：**

```json
{
  "lessons": [
    {
      "id": "l1",
      "startTime": "2025-02-03 10:00:00",
      "endTime": "2025-02-03 10:30:00",
      "curriculumOriginalName": "English 1v1",
      "siteName": "Site A",
      "oneToOneOrGroupId": 1
    },
    {
      "id": "l2",
      "startTime": "2025-02-05 14:00:00",
      "endTime": "2025-02-05 15:00:00",
      "curriculumOriginalName": "Group Class",
      "oneToOneOrGroupId": 2,
      "groupSize": 6
    }
  ]
}
```

转换方式：仅将 `lessons` 转为 events，可用 `buildEventsFromSchedulesAndBlockers([], lessons, [], [])`，或逐条 `convertLessonToEvent(lesson)`。得到的 **events** 结构与 6.4.1 中 lesson 示例一致，月视图与周视图共用该结构，仅数据范围不同。

**学生日程 · 月视图范围**：接口返回当月所有课程，结构同上，`lessons` 数组覆盖当月日期即可。

---

#### 6.4.4 小结

| 视图 | 组件接收 | 业务一（教师排班）输入 | 业务二（学生日程）输入 |
|------|----------|------------------------|------------------------|
| 月视图 | `events: EventInput[]`（同上） | schedules + lessons + ftl + assigned（整月范围） | lessons（整月范围） |
| 周视图 | `events: EventInput[]`（同上） | schedules + lessons + ftl + assigned（当周范围） | lessons（当周范围） |

两种业务下，月视图与周视图均使用同一 **events** JSON 结构；差异仅在数据来源与请求的日期范围（月/周）。

---

## 七、最小接入示例

```vue
<template>
  <BusinessCalendar
    initial-view="timeGridWeek"
    :business-hours="businessHours"
    :events="calendarEvents"
    :readonly="false"
    :config="calendarConfig"
    @dates-set="onDatesSet"
    @date-select="onDateSelect"
    @event-click="onEventClick"
    @event-change="onEventChange"
    @context-menu-action="onContextMenuAction"
  />
</template>

<script setup lang="ts">
import BusinessCalendar from '@/components/BusinessCalendar/index.vue';
import { useCalendarData } from '@/composables/useCalendarData';

const { parseBusinessHoursString, buildEventsFromSchedulesAndBlockers } = useCalendarData();

const businessHours = parseBusinessHoursString('(Mon-Fri)09:00-18:00');
const calendarConfig = {
  showHeader: true,
  slotDuration: '00:30:00',
  allowedViews: ['dayGridMonth', 'timeGridWeek'],
};

const calendarEvents = computed(() =>
  buildEventsFromSchedulesAndBlockers(schedules, lessons, ftl, assigned)
);

function onDatesSet(arg: { startStr: string; endStr: string }) {
  // 按 arg.startStr / endStr 拉取数据，更新 schedules、lessons 等
}
function onDateSelect(payload: any) {
  // 选中空白 30 分钟，可弹菜单创建 slot
}
function onEventClick(payload: any) {
  // 根据 eventType 打开详情或菜单
}
function onEventChange(payload: any) {
  // 保存新时间并刷新数据
}
function onContextMenuAction(payload: any) {
  // 根据 action 打开对应弹窗
}
</script>
```

---

## 八、自定义说明与能力使用方法

本节汇总**自定义事件块**、**自定义右键菜单**及**样式覆盖**的用法，便于按需扩展。

### 8.1 通过数据自定义内容（不换组件）

Slot 的文案与状态由传入的 **event 数据** 驱动，组件会据此渲染：

- **`title`**：主标题（课程名、排班状态名等）；若为空，会按 `eventType` / `statusId` 显示兜底文案。
- **`extendedProps`**：扩展字段，影响展示与样式：
  - `eventType`：`schedule` | `lesson` | `ftl` | `assigned` | `fixed`，决定类型与默认样式。
  - `statusId`：排班状态（如 199/200=Open、201=Group、204–208=Task、100–108=Inactive），决定 schedule 的标签与颜色。
  - `lockedFlag`：为 `true` 时显示锁图标。
  - `remark`：有值时显示备注角标（悬停可见备注）。
  - `oneToOneOrGroupId`：lesson 为 1 表示 1v1、2 表示团体，影响 lesson 的样式。

在构造或转换 `events` 时设置好 `title` 与 `extendedProps`，即可自定义每个 slot 的展示内容，无需改组件内部。

### 8.2 通过样式覆盖自定义外观（CSS 类名）

事件块使用稳定的 **CSS 类名**，在使用处通过样式覆盖即可自定义外观：

| 类名 / 范围 | 说明 |
|-------------|------|
| `.fc-event` | 事件最外层，可设 min-height、border 等 |
| `.bc-event-inner` | 内容容器，可设 padding、font-size、行高、对齐方式 |
| `.bc-event-title` | 标题区域 |
| `.bc-event-time` | 时间文案 |
| `.bc-event-schedule.bc-event-open` | 排班·可预约（绿色系） |
| `.bc-event-schedule.bc-event-group` | 排班·团体（蓝色系） |
| `.bc-event-schedule.bc-event-task` | 排班·任务（黄色系） |
| `.bc-event-schedule.bc-event-inactive` | 排班·不可用（灰色系） |
| `.bc-event-lesson.bc-event-lesson-1v1` | 课程·1v1 |
| `.bc-event-lesson.bc-event-lesson-group` | 课程·团体 |
| `.bc-event-ftl.bc-event-tag` / `.bc-event-assigned.bc-event-tag` | FTL / Assigned 标签 |
| `.bc-event-locked` | 锁定态（含锁图标） |
| `.bc-event-expired` | 过期态（半透明） |
| `.bc-event-remark-badge` | 备注角标 |

**示例**：在引用 BusinessCalendar 的页面中覆盖颜色与字体：

```css
/* 覆盖排班「可预约」为品牌色 */
:deep(.bc-event-schedule.bc-event-open) {
  background-color: #your-primary;
  border-color: #your-primary-dark;
  color: #fff;
}

/* 统一调大事件内边距与字号 */
:deep(.bc-event-inner) {
  padding: 6px 10px;
  font-size: 13px;
}
```

### 8.3 自定义事件块组件（eventContentComponent）

**能力**：用**自定义 Vue 组件**完全接管每个日历事件块的渲染，样式与结构由你决定。

**使用步骤**：

1. **定义一个接收 `arg` 的组件**  
   `arg` 由 FullCalendar 传入，类型为 `EventContentArg`（可从 `@fullcalendar/core` 引入），常用字段包括：
   - `arg.event`：当前事件（id、title、start、end、extendedProps 等）
   - `arg.timeText`：格式好的时间文案（如 "10:00 - 11:00"）
   - `arg.isPast` / `arg.isToday`：是否已过期、是否今天
   - `arg.view`：当前视图 API  

2. **在页面中把该组件传给日历**  
   使用 `:event-content-component="YourSlotComponent"`，不传则使用内置默认渲染。

**示例：自定义 Slot 组件**

```vue
<!-- MySlot.vue：完全由自己画的 slot -->
<template>
  <div class="my-slot">
    <span class="my-slot__title">{{ arg.event.title }}</span>
    <span v-if="arg.timeText" class="my-slot__time">{{ arg.timeText }}</span>
    <span v-if="arg.isPast" class="my-slot__badge">已过</span>
  </div>
</template>

<script setup lang="ts">
import type { EventContentArg } from '@fullcalendar/core';

defineProps<{
  arg: EventContentArg;
}>();
</script>

<style scoped>
.my-slot {
  padding: 4px 8px;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.my-slot__badge { opacity: 0.8; }
</style>
```

**在日历上使用：**

```vue
<template>
  <BusinessCalendar
    :events="calendarEvents"
    :event-content-component="MySlot"
  />
</template>

<script setup lang="ts">
import BusinessCalendar from '@/components/BusinessCalendar/index.vue';
import MySlot from './MySlot.vue';
// ...
</script>
```

传入 `eventContentComponent` 后，每个事件都会用你的组件渲染，样式和内容完全由该组件决定。

### 8.4 自定义右键菜单组件（contextMenuComponent）

**能力**：用**自定义 Vue 组件**完全接管右键菜单的渲染与交互，样式与菜单项由你决定。

**Slot 右键说明**：组件通过 `eventDidMount` 在每个 slot（事件块）上直接绑定 `contextmenu`，因 FullCalendar 可能在内部阻止冒泡。右键 slot 时 `target='event'`，`event` 有值，可据此展示 Lock/Remove 等并获取 slot 属性（id、title、start、end、extendedProps）。

**组件接收的 props**（类型见 `types.ts` 的 `ContextMenuSlotProps`）：

| 属性       | 类型   | 说明 |
|------------|--------|------|
| `visible`  | `boolean` | 是否显示菜单 |
| `x`, `y`   | `number`  | 菜单位置（像素） |
| `target`   | `'slot' \| 'event'` | 当前是点击空白(slot)还是点击事件(event) |
| `selection`| 见类型  | 仅当 target 为 `'slot'` 时有值，为当前选中的时间范围 |
| `event`    | 见类型  | 仅当 target 为 `'event'` 时有值，为当前事件信息 |
| `items`    | `{ action, label, disabled }[]` | 内置计算好的菜单项，可直接渲染或自绘 |

**组件需要 emit 的事件**：

- **`action`**：用户选择了某一项时触发，参数为 `action`（如 `'Reserve'`、`'Edit'`、`'Close'` 等），日历会关闭菜单并向外 emit `contextMenuAction`。
- **`close`**：仅关闭菜单（如点击空白处），不触发业务操作。

**示例：自定义右键菜单组件**

```vue
<!-- MyContextMenu.vue -->
<template>
  <div
    v-show="visible"
    class="my-context-menu fixed rounded border shadow-lg py-1 bg-white dark:bg-gray-800"
    :style="{ left: x + 'px', top: y + 'px', zIndex: 9999 }"
  >
    <div class="px-3 py-2 text-xs text-gray-500 border-b">
      {{ target === 'slot' ? '选中时段' : event?.title }}
    </div>
    <button
      v-for="item in items"
      :key="item.action"
      type="button"
      class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
      :disabled="item.disabled"
      @click="emit('action', item.action)"
    >
      {{ item.label }}
    </button>
    <button type="button" class="w-full text-left px-3 py-2 text-sm border-t" @click="emit('close')">
      {{ t('components.businessCalendar.contextMenu.close') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { ContextMenuSlotProps, ContextMenuActionType } from '@/components/BusinessCalendar/types';

const { t } = useI18n();
defineProps<ContextMenuSlotProps>();

const emit = defineEmits<{
  action: [action: ContextMenuActionType];
  close: [];
}>();
</script>
```

**在日历上使用：**

```vue
<template>
  <BusinessCalendar
    :events="calendarEvents"
    :context-menu-component="MyContextMenu"
    @context-menu-action="onContextMenuAction"
  />
</template>

<script setup lang="ts">
import BusinessCalendar from '@/components/BusinessCalendar/index.vue';
import MyContextMenu from './MyContextMenu.vue';

function onContextMenuAction(payload) {
  // payload: { action, target, selection?, event? }
}
</script>
```

传入 `contextMenuComponent` 后，右键菜单的样式和内容由该组件完全控制，仅需在用户选择时 emit `action`，日历会关闭菜单并触发 `context-menu-action`。

**类型与常量**：`ContextMenuSlotProps`、`ContextMenuActionType` 均从 `@/components/BusinessCalendar/types` 导入；`ContextMenuActionType` 取值为 `'Reserve' | 'Active' | 'Tasks' | 'Inactive' | 'Edit' | 'Lock' | 'Unlock' | 'Notes' | 'Remove' | 'Detail'`。

---

## 九、注意事项

1. **日期范围**：传入的 `events` 的 `start`/`end` 需与当前视图周/月重叠，否则看不到；懒加载时根据 `dates-set` 的 `startStr`/`endStr` 拉取对应范围数据。
2. **时间格式**：FullCalendar 使用 ISO8601（如 `2025-02-03T09:00:00`）；业务若用 `YYYY-MM-DD HH:mm:ss`，`useCalendarData` 内会做转换。
3. **只读与编辑**：`readonly: true` 时无法选择、拖拽；教师/基础排班需 `readonly: false` 并处理 `event-change` 与右键菜单。
4. **周视图高度**：周视图每格高度由组件内部与样式控制（如 80px），以保证 slot 内容可见；月视图为 `height: 'auto'`，内容过多时日历主体区域会出现纵向滚动条。
5. **Slot 右键**：Demo 中启用了 `contextMenuComponent`，演示 slot 右键获取 id/title/extendedProps 等属性，并展示 Lock/Remove 菜单；参考 `DemoCustomContextMenu` 与 `Calendar.vue`。

更多实现细节与检查清单见项目内《FullCalendar 组件业务规格文档》。

---

# 二、开发规范

以下约定适用于组件维护、扩展及与项目整体规范的对接。项目级规范见 [docs/DEVELOPMENT_STANDARDS.md](../../../docs/DEVELOPMENT_STANDARDS.md)。

---

## 十、文件结构与职责

| 文件 | 职责 |
|------|------|
| `index.vue` | 组件主文件：Props、自定义 Header、calendarOptions、eventDidMount（slot 右键）、动态高度、事件与右键菜单、eventWillUnmount 生命周期 |
| `types.ts` | Props、BusinessHoursSegment、BusinessCalendarConfig、ViewType、ContextMenuSlotProps、常量（DEFAULT_VIEW、SLOT_HEIGHT_PX 等） |
| `utils.ts` | 纯工具函数：营业时段解析、slotMinMax 计算、周视图 contentHeight 计算 |
| `README.md` | 本文档 |

**依赖关系**：

- 组件依赖 `@/composables/useCalendarData` 做数据转换与 Slot 拆分；数据逻辑不内嵌在组件内。
- 使用方通过 `useCalendarData().parseBusinessHoursString`、`buildEventsFromSchedulesAndBlockers` 等接入业务数据。

---

## 十一、类型与导出约定

- **类型**：所有对外类型定义于 `types.ts`，统一从 `@/components/BusinessCalendar/types` 导出。
- **导出内容**：`BusinessCalendarProps`、`BusinessCalendarConfig`、`BusinessHoursSegment`、`ViewType`、`ContextMenuSlotProps`、`ContextMenuActionType`、`DEFAULT_*`、`SLOT_HEIGHT_PX`。
- **Payload 类型**：`NavigatePayload`、`DateSelectPayload`、`EventClickPayload`、`EventChangePayload`、`ContextMenuActionPayload` 在 `index.vue` 中定义并 export，便于使用方类型推导。
- **禁止**：在组件内部使用 `any`；新增 Props/Config 时同步更新 `types.ts` 与本文档 §4。

---

## 十二、主题与暗色模式

- **FullCalendar 变量**：通过 `:deep(.fc)` 覆盖 `--fc-border-color`、`--fc-page-bg-color`、`--fc-neutral-bg-color`、`--fc-today-bg-color`，使用 `var(--el-*)` 与 Element Plus 主题变量联动。
- **事件块样式**：`.bc-event-*` 类使用固定色值，暗色下需保证对比度（如 `.bc-event-task` 在 `dark` 下保持深色文字）。
- **自定义 Slot/右键菜单**：传入的 `eventContentComponent`、`contextMenuComponent` 须自行支持 `dark:` 样式；示例见 `DemoCustomContextMenu` 的 `dark:bg-gray-800`、`dark:border-gray-600`。

---

## 十三、国际化

- **语言包位置**：`src/locales/<locale>.json` 下 `components.businessCalendar`，包含 `viewMonth`、`viewWeek`、`today`、`placeholderMonth`、`placeholderDate`、`contextMenu.*`。
- **使用方式**：组件内通过 `useI18n().t('components.businessCalendar.xxx')` 获取文案。
- **覆盖机制**：`config.i18n` 可覆盖任意文案，未传入的字段使用 i18n 键；适用于未接入 i18n 或需按业务定制文案的场景。
- **自定义组件**：`contextMenuComponent` 若需 i18n，使用 `t('components.businessCalendar.contextMenu.close')` 等；参考 `DemoCustomContextMenu`。

---

## 十四、扩展与修改自检清单

新增或修改 BusinessCalendar 时，按下列项自检：

| 检查项 | 说明 |
|--------|------|
| 类型同步 | 新增 Props/Config 是否已更新 `types.ts` 并导出 |
| 文档同步 | README §4 Props/Config 是否已补充新项 |
| 主题 | 新增 UI 是否支持浅色与暗色（含 `dark:` 前缀） |
| i18n | 新增用户可见文案是否使用 `t()` 或提供 `config.i18n` 覆盖 |
| 自定义 Slot 生命周期 | 使用 `eventContentComponent` 时，`eventWillUnmount` 是否正确 unmount 对应 Vue app |
| Slot 右键 | `eventDidMount` 是否在 slot 上正确绑定 contextmenu，右键 slot 能否弹出菜单 |
| 项目规范 | 布局、请求、权限等是否符合 [DEVELOPMENT_STANDARDS.md](../../../docs/DEVELOPMENT_STANDARDS.md) |
