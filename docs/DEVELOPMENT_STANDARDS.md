# LiteVuePro 开发规范

本文档为项目**唯一开发规范**，约定前端开发、布局、样式、组件、路由、接口与 Mock、状态管理、Vite 配置、权限及 Cursor/AI 辅助开发须遵守的规则。所有新页面与组件、以及由 Cursor/AI 生成或修改的代码均须符合本规范。技术细节以 [ARCHITECTURE.md](./ARCHITECTURE.md) 为准；权限以 [PERMISSION.md](./PERMISSION.md)；状态管理以 [PINIA_GUIDE.md](./PINIA_GUIDE.md)。

---

## 1. 页面布局

### 1.1 宽度

- **页面不设置最小宽度（min-width）和最大宽度（max-width）。**
- **默认需要宽度时统一使用 `width: 100%`**（或 UnoCSS 的 `w-full`）。
- 页面根容器、主内容区使用 `w-full`，禁止对页面级容器设置 `min-width`、`max-width`。

**推荐：**

```vue
<template>
  <div class="page-root w-full h-full overflow-auto">
    <div class="p-6 w-full">
      ...
    </div>
  </div>
</template>
```

**不推荐：**

```vue
<!-- 不推荐：页面设置 min-width / max-width -->
<div class="page-root min-w-1200px max-w-1200px mx-auto">
```

### 1.2 布局方向

- **默认布局由上到下、从左到右**（文档流）。无需额外设置时保持默认块级/行内流即可。

### 1.3 高度与滚动

- 全屏布局使用 `h-full`（100% 高度），配合父级 `flex` 或 `height: 100%`，避免整页被内容撑开导致双滚动条。
- 需要滚动的区域使用 `overflow-auto` 或 `overflow-y-auto`，保证仅内容区滚动。

### 1.4 禁止横向滚动条

- **视口不得出现横向滚动条。** 布局与内容不得撑出视口宽度。
- **全局使用 `box-sizing: border-box`**（已在 `src/assets/css/style.css` 中设置），使 `width: 100%`（w-full）包含 padding、border，避免「w-full + padding」总宽度超过 100% 而出现横向滚动条。不得改为 `content-box`。
- 根层级（如 `html`、`body`、`#app`）或主内容区使用 `overflow-x: hidden`，避免整页横向滚动。
- Flex 子项若需参与收缩（如主内容区），使用 `min-width: 0`（UnoCSS：`min-w-0`），使 flex 子项可收缩，避免撑出横向滚动。
- **宽内容**（表格、`<pre>`、长行文本等）必须放在**自带横向滚动**的容器内：`overflow-x-auto`，由该容器内部横向滚动，不得撑开整页。

### 1.5 表格横向滚动（el-table）

- **必须**：列数较多或列宽总和可能超出视口的 **el-table**，外层须包一层 `overflow-x-auto` 的容器（如 `class="w-full overflow-x-auto"`），由容器提供横向滚动，禁止表格直接撑出视口。
- **推荐写法**：
  ```vue
  <div class="w-full overflow-x-auto">
    <el-table :data="tableData">
      <el-table-column prop="name" label="名称" />
      <!-- 多列 -->
    </el-table>
  </div>
  ```

---

## 2. 样式与类名

- 优先使用 **UnoCSS** 原子类（如 `w-full`、`p-6`、`flex`）；复杂或复用样式使用 **Sass/SCSS**（SCSS 内用 `@use 'styles/xxx.scss'`）。
- 组件与页面根节点使用语义化 class（如 `demo-layout`、`page-xxx`），避免裸 div 堆叠。

---

## 3. 主题与暗色模式

项目支持 **浅色 / 暗色 / 跟随系统** 三种主题，由 `appStore` 管理，切换时在 `html` 上添加或移除 `dark` 类。**新增或修改的页面、组件均须支持浅色主题和暗色主题**。

### 3.1 机制说明

| 项目 | 说明 |
|------|------|
| 主题切换 | `useAppStore().setTheme('light' \| 'dark' \| 'auto')` 或 `toggleTheme()` |
| 暗色触发 | `html` 上存在 `dark` 类时启用暗色模式 |
| UnoCSS | 使用 `dark:` 前缀，如 `bg-white dark:bg-gray-900` |
| Element Plus | 已导入 `element-plus/theme-chalk/dark/css-vars.css`，随 `html.dark` 自动应用 |
| 全局背景 | `src/assets/css/style.css` 中 `html.dark` 规则设置根层与 body 背景为 `#0f172a`（slate-900），布局区使用 `#1e293b` |

### 3.2 配色约定

| 用途 | 浅色 | 暗色 |
|------|------|------|
| 页面/容器背景 | `bg-white` | `dark:bg-gray-900` |
| 主文字 | `text-gray-800` | `dark:text-gray-200` |
| 次级文字 | `text-gray-600` | `dark:text-gray-400` |
| 边框 | `border-gray-200` | `dark:border-gray-700` |
| hover 背景 | `hover:bg-gray-100` | `dark:hover:bg-gray-800` |
| **按钮内图标** | `text-gray-600` | `dark:text-gray-300` |

### 3.3 开发规范

- **背景**：页面根容器、Layout 主内容区、Header、Sidebar、TabNav 等使用 `bg-white dark:bg-gray-900`，保证浅色与暗色下背景正确。
- **文字**：自定义 slot 或非 Element 组件内的文字必须显式加 `dark:` 文字色，如 `text-gray-800 dark:text-gray-200`，避免暗色背景下黑色文字看不清。
- **图标**：图标需设置暗色下可见色，如 `text-gray-600 dark:text-gray-300`。
- **Element Plus**：其组件在暗色模式下由 `element-plus/theme-chalk/dark/css-vars.css` 自动适配，无需额外覆盖；自定义 slot 内样式除外。

#### 3.3.1 按钮内图标与文字配色

**原则**：**按钮内图标与文字必须同色**，保证视觉一致性并在浅色/暗色主题下均可读。

**el-button** 的 slot 中使用的 **Icon 组件**（如 `unplugin-icons` 的 `<Icon icon="ep:search" />`）须显式设置颜色类，否则暗色下图标可能难以辨认；且该颜色须与同按钮内文字一致。

| 按钮类型 | 推荐图标 class | 说明 |
|----------|----------------|------|
| 默认、plain、link、text | `text-gray-600 dark:text-gray-300` | 图标与文字同色；默认按钮文字使用该色时，图标也须使用 |
| primary / success / warning / danger 等 | `text-inherit` 或与文字同色 | 优先 `text-inherit` 继承按钮前景色；若继承异常，显式使用与文字一致的颜色 |
| 间距 | `mr-5px` 或 `ml-5px` | 图标与文字并排时，图标侧加 margin 留出空隙 |

**推荐写法：**

```vue
<!-- 默认/plain 按钮：图标与文字同色 -->
<el-button @click="handleQuery" class="text-gray-600 dark:text-gray-300">
  <Icon icon="ep:search" class="mr-5px text-inherit" /> 搜索
</el-button>
<!-- 或：图标显式与文字同色 -->
<el-button @click="handleQuery">
  <Icon icon="ep:search" class="mr-5px text-gray-600 dark:text-gray-300" /> 搜索
</el-button>

<!-- primary/plain：图标继承按钮文字色 -->
<el-button plain type="primary">
  <Icon icon="ep:plus" class="mr-5px text-inherit" /> 新增
</el-button>
```

**禁止**：按钮内图标无颜色类，或图标与按钮内文字颜色不一致，导致暗色下看不清或视觉割裂。
- **禁止**：仅写浅色或仅写暗色样式，导致另一主题下不可用；或使用与背景对比度不足的颜色。

### 3.4 自检清单

新增或修改带 UI 的代码时检查：

1. 浅色与暗色下，背景、文字、边框、hover 是否均有对应样式？
2. 自定义 slot（如 TabNav 标签标题、关闭图标）在两种主题下是否可读？
3. **按钮内图标**是否与文字同色，且在暗色下可读（§3.3.1）？
4. 是否误删或覆盖 `src/assets/css/style.css` 中的 `html.dark` 规则？

---

## 4. 组件与视图

- 页面级视图放在 `src/views/`，按功能模块分目录。
- 公共组件放在 `src/components/`。
- **Layout 骨架**：`src/layout/` 下采用**统一文件夹结构**，每个子组件为 `ComponentName/index.vue`（如 `AppHeader/index.vue`、`TabNav/index.vue`），入口为 `Index.vue`；引用约定见下文 §4.1、§4.2。
- 使用 Element Plus 时，组件与 API 已全局注册，按 [ARCHITECTURE.md](./ARCHITECTURE.md) 与 [PINIA_GUIDE.md](./PINIA_GUIDE.md) 约定使用。

### 4.1 Layout 子组件引用路径

- **根入口 `layout/Index.vue`** 引用同目录下子组件时，使用相对路径即可：`./AppSidebar/index.vue`、`./AppHeader/index.vue`、`./TabNav/index.vue`。
- **Layout 内部子组件互相引用**（例如 `AppSidebar/index.vue` 引用 `AppSidebarItem`）时，使用 `@/layout/ComponentName/index.vue`。

**推荐：**

```ts
// 在 AppSidebar/index.vue 中引用 AppSidebarItem
import AppSidebarItem from '@/layout/AppSidebarItem/index.vue';
```

**不推荐：**

```ts
// 在 layout 内部用相对路径引用其他 layout 子组件，可能导致解析失败
import AppSidebarItem from '../AppSidebarItem/index.vue';
```

### 4.2 Layout 递归组件必须显式声明 name

- 若 Layout 子组件为**递归组件**（在自身模板中再次使用自己，例如 `AppSidebarItem` 渲染子菜单时再使用 `<AppSidebarItem>`），**必须在 `<script setup>` 中通过 `defineOptions({ name: 'ComponentName' })` 显式声明组件名**。
- **原因**：以 `index.vue` 命名的文件在编译时可能被推断为组件名 `Index`，父组件或自身模板中的 `<AppSidebarItem>` 无法据此解析，会导致「Failed to resolve component: AppSidebarItem」；显式声明 `name` 后，父组件与递归引用均可正确解析。

**必须：**

```vue
<script setup lang="ts">
defineOptions({ name: 'AppSidebarItem' });
// ...
</script>
```

### 4.3 标签页对应页面的 keep-alive 缓存（与 TabNav 联动）

- **缓存对象**：缓存的是一级/叶子路由对应的**页面组件**（点击 Tab 后跳转到的页面内容），**不是** TabNav 标签栏组件本身。TabNav 仅负责展示已访问标签、点击跳转；keep-alive 由 `tabNavStore.cachedNames` 控制，缓存的是这些标签对应的路由页面。
- Layout 使用 **`router-view` + keep-alive**，采用 `:max` 限制缓存数量（如 `keep-alive :max="15"`），不依赖 `include`，因异步组件 name 可能未就绪导致 include 匹配失败；详见 [ARCHITECTURE.md](./ARCHITECTURE.md) §4.6。
- **需被缓存的页面**：路由须有 **`name`**，对应页面组件须 **`defineOptions({ name: '路由 name' })`**，才能被 keep-alive 按名缓存。

### 4.4 自检清单（Layout 与组件）

- 新增或修改 Layout 子组件时：是否在 layout 内部用 `@/layout/Xxx/index.vue` 引用其他子组件？
- 递归组件是否已添加 `defineOptions({ name: 'Xxx' })`？
- 新增「点击标签后需被缓存」的页面时：路由是否已加 `name`？页面组件是否已加 `defineOptions({ name: '路由 name' })`？

---

## 5. 目录与资源放置（单应用）

| 资源类型 | 放置位置 | 引用方式 |
|----------|----------|----------|
| Layout | `src/layout/` | `@/layout/xxx` |
| 页面视图 | `src/views/`，按功能分子目录 | `@/views/xxx` |
| API | `src/api/`，按模块拆分 | `@/api`、`@/api/xxx` |
| Mock | `src/mocks/`，按模块与 api 对应 | `src/mocks/handlers.ts` 聚合 |
| 样式 | `src/styles/` | SCSS 内 `@use 'styles/xxx.scss'` |
| 公共组件 | `src/components/` | `@/components/xxx` |
| 语言包 | `src/locales/<locale>.json` | i18n 自动加载 |

---

## 6. Utils 与 Composables 分层（避免循环依赖）

- **utils/**：纯工具函数，不含 Vue 响应式逻辑；**禁止** `import` composables 或 store；可 import 其他 utils、types、第三方库。
- **composables/**：组合式函数（`useXxx`），可使用 Vue 响应式、store、**可** import utils；**禁止** import 其他 composables（避免循环）。
- **自动导入**：`unplugin-auto-import` 配置 `dirs: ['src/composables', 'src/utils']`，两者均可自动导入；写 utils 时勿引用 composables，从源头避免循环。
- **自检**：新增 utils 时确认未 import composables；新增 composables 时确认未 import 其他 composables。

---

## 7. 目录与命名

### 7.1 目录与文件放置一览

| 内容类型 | 放置位置 | 说明 |
|----------|----------|------|
| Layout | `src/layout/` | 引用 `@/layout/xxx` |
| 页面视图 | `src/views/`，按功能分子目录 | 如 `views/Demo/Overview.vue`、`views/Auth/Login.vue` |
| 公共组件 | `src/components/` | 全局复用 |
| API | `src/api/`，按模块拆分 | `api/index.ts` 聚合导出 |
| Mock | `src/mocks/`，按模块与 api 对应 | `handlers.ts` 聚合 |
| Store 模块 | `src/store/modules/` | 按领域划分 |
| 路由定义 | `src/router/index.ts` | 页面用 `@/views/...` 懒加载 |
| 语言包 | `src/locales/<locale>.json` | 如 `zh-CN.json`、`en.json` |
| 类型定义 | `src/types/`（业务）、根目录 `types/`（env、auto-import） | 扩展路由 meta、Store、配置等 |

### 7.2 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 页面根 class | 语义化，带 `page-` 或功能前缀 | `page-root`、`demo-layout`、`auth-login` |
| 组件文件名 | PascalCase，与组件名一致 | `Overview.vue`、`SvgIcon/index.vue` |
| Layout 子组件 | `ComponentName/index.vue`；内部互相引用 `@/layout/Xxx/index.vue`；递归组件必须 `defineOptions({ name: 'Xxx' })` | `AppHeader/index.vue`、`TabNav/index.vue` |
| API 函数 | 动词或 getXxx / createXxx | `getHealth`、`login`、`fetchUserList` |
| Mock handlers 变量 | xxxHandlers | `demoHandlers`、`authHandlers` |
| Store 模块 | 小驼峰，语义清晰 | `user`、`app`、`tabNav`、`featureFlags` |
| 路由 name | 小驼峰 | `home`、`login`、`demo-overview` |
| i18n key | 小写 + 点分隔，按模块分组 | `common.loading`、`auth.loginTitle` |

---

## 8. 路由

- **定义**：在 `src/router/index.ts` 中配置；页面使用懒加载 `@/views/...`。
- **Meta 约定**：使用已扩展字段（见 `src/types/router.d.ts`）：`title`、`requireAuth`、`roles`、`permissions`、`hidden`、`noCache`、`noTagsView` 等；权限与白名单逻辑见 [PERMISSION.md](./PERMISSION.md)。

---

## 9. 接口与 Mock

### 9.1 请求层

- **请求方式**：统一使用项目封装的 Alova 实例（`src/utils/http.ts`），**禁止**在业务代码中直接使用裸 `fetch`、`axios` 或新建 Alova 实例。
- **API 定义位置**：接口写在 `src/api/` 下按模块拆分，在 `api/index.ts` 中聚合导出；调用方通过 `@/api` 或 `@/api/xxx` 引用。
- **baseURL**：由 http 层统一处理（环境变量 `VITE_API_BASE_URL` 或 `app.config.ts` 的 `api_url`）；开发环境且 `enableMsw: true` 时 baseURL 为空，便于 MSW 拦截。
- **Token 与 401**：Token 从 User Store 读取并注入请求头；401 由全局未授权处理器处理（登出并跳转登录），业务代码不重复处理 401。
- **Loading**：全局请求计数与 `appStore.globalLoading` 已集成，无需在页面内为通用请求再写全屏 Loading。

### 9.2 接口缓存约定

- **默认不缓存**：`src/utils/http.ts` 中 Alova 实例已设置 `cacheFor: null`，**所有接口默认不缓存**，增删改后数据即时反映。
- **需缓存时显式添加**：仅对确有需求、数据变动频率低的接口（如字典树、静态配置等）在 method 配置中显式添加 `cacheFor: number`（毫秒）。
- **禁止**：在未评估数据 freshness 需求的情况下为接口启用缓存。

### 9.3 Mock

- **默认要求**：为页面使用的接口**配套 Mock**，且 Mock 与接口约定一致（路径、方法、请求体/查询参数、响应结构含列表/分页/状态码等）。
- **组织方式**：`src/mocks/` 下按模块建文件（如 `demo.ts`、`auth.ts`），导出 `xxxHandlers`，在 `handlers.ts` 中聚合为 `handlers`。
- **启用条件**：开发环境且 `app.config.ts` 中 `enableMsw: true` 时才会启动 MSW。

### 9.4 表单校验（VeeValidate + Zod / formRules）

- **新表单推荐**：使用 **VeeValidate + Zod**（`useForm`、`toTypedSchema`、`defineField`），声明式 Schema、TS 类型推导、与 Element Plus 通过 `:error="errors.xxx"` 集成。示例见 `Login.vue`，导出见 `src/composables/useVeeForm.ts`。
- **旧表单兼容**：`formRules`（`@/utils/formRules`）与 Element 的 `el-form` `:rules` 仍可用，无需强制迁移。
- **禁止**：混用两者于同一表单；utils 中不引入 composables（见 §5.6）。

### 9.5 el-form 防重复提交

使用 `el-form` 的弹窗表单**必须**做到以下三点，避免 Enter + 点击或快速双击导致重复提交：

| 约定 | 说明 |
|------|------|
| `@submit.prevent="submitForm"` | 阻止原生 form submit，由我们统一处理；Enter 键也会走同一逻辑 |
| 确定按钮 `native-type="button"` | 避免按钮触发表单原生提交，否则点击会同时触发 `@click` 和 form submit |
| `formLoading` 在 `validate` 之前置 true | 在 `submitForm` 开头立即 `formLoading.value = true`，`validate` 失败时在 catch 中复位 |

示例：`UserForm.vue`、`DeptForm.vue`。

---

## 10. 状态管理（Pinia）

- **使用已有模块**：用户态用 `useUserStore`，应用全局用 `useAppStore`，标签栏用 `useTabNavStore`，功能开关用 `useFeatureFlagsStore`，缓存用 `useCacheStore`；权限判断使用 `userStore.hasPermission` / `hasRole`，勿重复实现。
- **新增 Store**：放在 `src/store/modules/`，按领域命名；需持久化时使用 `pinia-plugin-persistedstate`，key 如 `app`、`user`、`tabnav`。
- **异步与分页**：优先使用 `useStoreWithLoading`、`useStoreWithPagination` 等已有 composables，见 [PINIA_GUIDE.md](./PINIA_GUIDE.md)。

---

## 11. 国际化

- **使用方式**：在组件内使用 `useI18n()` 的 `t`、`locale` 等；日期/相对时间使用 `src/utils/dayjs.ts` 导出的方法，并与 i18n 语言同步（`setDayjsLocale`）。
- **语言包**：放在 `src/locales/<locale>.json`，key 按模块分组；`app.config.ts` 的 `supportedLocales` 控制支持的语言。

---

## 12. 安全与富文本

- **禁止**：使用 `v-html` 渲染用户或外部数据。
- **必须**：使用项目提供的 `v-dompurify-html` 指令（见 `src/utils/dompurify.ts`），如 `<div v-dompurify-html="rawHtml" />` 或带命名配置 `v-dompurify-html="[rawHtml, 'rich']"`。

---

## 13. 类型与 TypeScript

- **类型定义**：业务类型与扩展放在 `src/types/`（如 `router.d.ts`、`store.d.ts`、`tabNav.d.ts`）；环境与全局 define 放在根目录 `types/env.d.ts`。
- **扩展路由 meta**：在 `src/types/router.d.ts` 中扩展 `RouteMeta`，勿在业务文件中重复声明 meta 类型。
- **禁止**：使用 `any` 规避类型；未定义的 meta 字段需先在 `router.d.ts` 中声明。

---

## 14. 权限

- **路由级**：通过 `meta.requireAuth`、`meta.roles`、`meta.permissions` 控制访问，白名单与守卫逻辑见 [PERMISSION.md](./PERMISSION.md)。
- **视图级**：使用项目提供的 `v-permission` 指令控制按钮/区域显隐，权限码与后端/User Store 的 `permissions` 一致。

---

## 15. Vite 配置

本节约定 **Vite 8** 项目配置的规范（当前 ^8.0.0-beta，内置 Rolldown）。因部分插件未声明 Vite 8 peer，根目录 `.npmrc` 中需保留 `legacy-peer-deps=true` 以便安装。

### 15.1 配置结构

| 约定 | 说明 |
|------|------|
| **defineConfig 包装** | 根配置必须使用 `defineConfig()` 包装，以获得类型提示与校验 |
| **TypeScript** | 使用 `vite.config.ts`，避免 `.js` 配置 |
| **ESM** | 配置与构建脚本使用 ESM（`"type": "module"`） |

### 15.2 环境变量与 loadEnv

- `.env` 在配置解析**之后**加载，需在配置中访问时使用 `loadEnv(mode, process.cwd(), '')`。
- **API 代理**：开发环境连接本地后端时，在 `.env.[mode]` 中设置 `VITE_PROXY_TARGET=http://localhost:8080`，将 `/api` 代理到该地址。

### 15.3 build 配置

| 选项 | 约定 |
|------|------|
| **target** | 显式设置 `build.target`（如 `esnext`、`es2022`），按目标浏览器优化产物 |
| **outDir** | 单应用输出 `dist/` |
| **rolldownOptions** | 企业项目使用 `output.manualChunks` 拆分 vendor（element-plus、fullcalendar、pinia、validation 等），利于缓存 |
| **optimizeDeps** | 预打包 vue、element-plus、@fullcalendar/core、vee-validate、zod 等，加速开发冷启动 |
| **Element Plus** | 使用 unplugin-vue-components 的 ElementPlusResolver 按需引入组件；ElMessage/ElMessageBox/ElNotification/ElLoading 由 unplugin-auto-import 自动注入 |

### 15.4 插件顺序（Vite 8 / Rolldown）

- **build-only 插件**：使用 `enforce: 'post'` 与 `apply: 'build'`（或仅在 build 时加入），在构建阶段最后执行。
- **resolve 相关**：需优先解析的插件使用 `enforce: 'pre'`（如 i18n 虚拟模块）。
- 顺序：Alias → `enforce: 'pre'` → 核心插件 → 用户插件 → 构建插件 → `enforce: 'post'`。

### 15.5 路径解析

- 路径工具函数避免冗余参数，如 `resolve(root, dir)` 而非 `resolve(root, '.', dir)`。
- **别名**：`@/` → `src/`。

### 15.6 虚拟模块

- 用户-facing 路径使用 `virtual:` 前缀，内部 resolved id 使用 `\0` 前缀。
- 虚拟模块需在 `src/vite-env.d.ts` 或 `types/` 中声明类型。

### 15.7 自检清单（Vite 配置）

- 根配置是否使用 `defineConfig()`？
- `build.target` 是否已显式设置？
- build-only 插件是否加 `enforce: 'post'`？

---

## 16. 禁止项（Anti-patterns）

- 页面或根容器设置 `min-width` / `max-width`，或导致视口出现横向滚动条。
- **宽表格**（列多或列宽超出视口）未使用外层 `overflow-x-auto` 容器，导致整页出现横向滚动条；应按 §1.5 处理。
- **在 layout 内用相对路径引用其他 layout 子组件**（如 `../AppSidebarItem/index.vue`），导致构建/运行时「Failed to resolve component」；应使用 `@/layout/Xxx/index.vue`。
- **递归组件（在自身模板中引用自己的 Layout 子组件）未使用 `defineOptions({ name: 'Xxx' })`**，导致父组件或自身无法解析组件名。
- 仅写浅色或仅写暗色样式，导致另一主题下背景或文字不可读。
- **按钮内图标**与文字颜色不一致，或图标无颜色类导致暗色下看不清；应遵守 §3.3.1（图标与文字同色）。
- **SCSS**：在 `<style lang="scss">` 中使用 `@use 'styles/xxx.scss'`；应使用 `@use 'styles/xxx.scss'`。
- 在业务代码中直接使用 `fetch`/`axios` 或新建 Alova 实例，绕过 `src/utils/http.ts`。
- **接口缓存**：在未明确评估 freshness 需求的情况下为接口启用缓存（`cacheFor > 0`）；新增接口默认缓存；见 §9.2。
- 使用 `v-html` 渲染不可信内容。
- 新增接口不配套 Mock，或 Mock 路径/响应与页面约定不一致。
- 在 Store 或路由中重复实现权限判断，而不使用 `userStore.hasPermission` 与 `meta.permissions`。
- 在未扩展的类型上使用 `meta.roles`/`meta.permissions` 等而未在 `src/types/router.d.ts` 声明。
- 使用 `any` 或忽略 TypeScript 报错。
- **Vite**：根配置未使用 `defineConfig` 包装；build-only 插件未加 `enforce: 'post'`。

---

## 17. 自检清单（修改后必查）

生成或修改代码后，按下列项自检：

1. **放置**：页面在 `src/views/`，API 在 `src/api/`，Mock 在 `src/mocks/` 并聚合到 `handlers.ts`。
2. **Layout**：Layout 子组件互相引用使用 `@/layout/Xxx/index.vue`；**递归的 Layout 子组件已 `defineOptions({ name: 'Xxx' })`**；**SCSS 中用 `@use 'styles/xxx.scss'`**。
3. **路由**：页面使用 `() => import('@/views/...')`；meta 需权限时已设 `roles`/`permissions`/`requireAuth`。
4. **请求**：使用封装的 http（Alova），未使用裸 fetch/axios；接口默认不缓存（http 层已设 `cacheFor: null`），需缓存时在 method 上显式添加 `cacheFor`。
5. **Mock**：新接口已配套 Mock，路径与响应结构与约定一致。
6. **布局**：无 min/max-width，无横向滚动条，宽度用 w-full，滚动区用 overflow-auto；**宽表格**使用外层 `overflow-x-auto` 容器（§1.5）。
7. **主题**：浅色与暗色下，背景、文字、边框、hover 均有对应样式；自定义 slot 内文字在暗色下可读；**按钮内图标与文字须同色**（§3.3.1）。
8. **富文本**：使用 `v-dompurify-html`，未使用 `v-html`。
9. **类型**：无 `any`，meta 新字段已在 `router.d.ts` 声明。
10. **权限**：需权限控制处使用 `userStore.hasPermission` 或 `v-permission`，路由使用 meta 约定。
11. **Vite 配置**（修改 `vite.config.ts` 时）：是否使用 `defineConfig`？`build.target` 是否已设置？build-only 插件是否加 `enforce: 'post'`？
12. **Git 提交**（AI 协助时）：中文信息是否使用 `git commit -F msg.txt`，禁止 `-m "中文"`？见 §18。

---

## 18. Git 提交（AI / 助手协助时）

**提交中文信息禁止使用 `git commit -m "中文"`**，须改用 `git commit -F msg.txt`：

1. 将提交信息写入 UTF-8 编码的临时文件
2. 执行 `git commit -F msg.txt`
3. 提交完成后删除临时文件

message 从 UTF-8 文件读取，不经过终端编码，可避免乱码。

---

## 19. 参考文档

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 技术架构（含布局/路由/菜单/缓存、表格横向滚动 overflow-x-auto） |
| [PERMISSION.md](./PERMISSION.md) | 权限模块 |
| [PINIA_GUIDE.md](./PINIA_GUIDE.md) | 状态管理 |
| [BusinessCalendar/README.md](../src/components/BusinessCalendar/README.md) | 业务日历组件：功能说明书 + 开发规范 |
| `.cursor/skills/vite/` | Vite 8 配置与 Rolldown 迁移参考 |
