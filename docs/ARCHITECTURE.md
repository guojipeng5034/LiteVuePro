# LiteVuePro 技术架构文档

本文档为**技术架构总览**，描述单应用管理端框架的完整技术架构，涵盖构建系统、国际化、路由与埋点、**前端布局/菜单/Tab 与 keep-alive 缓存**、UI/样式、安全渲染、更新通知、网络层与 Mock、**错误边界与异常上报**。

**阅读指引**：建议按顺序阅读 §1 技术栈 → §2 国际化 → §4 路由与布局 → §5 状态管理 → §8 网络与 Mock。

---

## 1. 技术栈总览

| 分类       | 选型                     | 说明 |
|------------|--------------------------|------|
| **框架**   | Vue 3                    | `<script setup>` SFC，Composition API |
| **语言**   | TypeScript 5.9           | 严格模式 |
| **构建**   | Vite 8 (Rolldown)        | 异步配置、按 mode 加载 env |
| **状态管理** | Pinia 3.x              | 模块化 store，持久化插件 |
| **UI 库**  | Element Plus 2.x         | 按需自动导入 |
| **样式**   | Sass + UnoCSS 66.x       | UnoCSS 原子类，Sass 复杂样式 |
| **国际化** | vue-i18n 10.x            | 按 app.config 的 supportedLocales 加载语言包 |
| **路由**   | Vue Router 4.x           | History 模式，与 NProgress 集成 |
| **请求**   | Alova 3.x                | 全局拦截、Token、统一错误处理 |
| **Mock**   | MSW 2.x                  | 开发环境 Service Worker 拦截 |

---

## 2. 应用配置

- **配置文件**：`src/app.config.ts` 导出 `AppConfig`（api_url、enableMsw、feature_flags、supportedLocales、defaultLocale、tabNav）。
- **运行时**：`src/utils/appConfig.ts` 提供 `getAppConfig()`。

---

## 3. 国际化

- **语言包**：`src/locales/<locale>.json`。
- **配置**：`app.config.ts` 的 `supportedLocales`、`defaultLocale`。
- **i18n**：`src/utils/i18n.ts` 的 `setupI18n()` 根据 supportedLocales 动态加载语言包。

---

## 4. 路由与全局工具

- **路由**：`src/router/index.ts`，页面使用 `@/views/...` 懒加载。
- **布局**：根 path `'/'` 使用 `@/layout/Index.vue`，子组件在 `src/layout/`。
- **权限守卫**：`src/router/permission.ts` 提供 `setupPermissionGuard(router)`。
- **NProgress**：`beforeEach` 中 start，`afterEach` 中 done。
- **服务器时间**：`src/utils/serverTime.ts`，首次校时后推算，每小时校正。

---

## 5. 状态管理 (Pinia)

- **模块**：user、app、tabNav、featureFlags、cache。
- **持久化**：pinia-plugin-persistedstate，key 如 `app`、`user`、`tabnav`。
- **详见**：[PINIA_GUIDE.md](PINIA_GUIDE.md)。

---

## 6. 网络层与 Mock

- **Alova**：`src/utils/http.ts`，baseURL 来自 `VITE_API_BASE_URL` 或 `getAppConfig().api_url`；开发且 enableMsw 时为空便于 MSW 拦截。
- **Mock**：`src/mocks/` 按模块（demo、auth、system），`handlers.ts` 聚合，由 `app.config.enableMsw` 控制启用。

---

## 7. 目录结构

```
LiteVuePro/
├── build/vite/index.ts     # Vue、UnoCSS、auto-import、components
├── scripts/update-version-json.js
├── src/
│   ├── app.config.ts       # 应用配置
│   ├── api/                # API 按模块
│   ├── layout/             # 布局骨架
│   ├── views/              # 页面视图
│   ├── mocks/              # MSW handlers
│   ├── locales/            # 语言包
│   ├── store/              # Pinia
│   ├── router/             # 路由与权限
│   ├── utils/              # 工具（http、appConfig、i18n 等）
│   └── components/        # 封装组件
├── vite.config.ts
└── docs/
```

---

## 8. 参考文档

| 文档 | 说明 |
|------|------|
| [DEVELOPMENT_STANDARDS.md](DEVELOPMENT_STANDARDS.md) | 开发规范 |
| [PERMISSION.md](PERMISSION.md) | 权限模块 |
| [PINIA_GUIDE.md](PINIA_GUIDE.md) | Pinia 状态管理 |
| [WEB_UPDATE_NOTICE.md](WEB_UPDATE_NOTICE.md) | 更新通知 |
