# 权限模块设计文档

本文档描述企业级管理端框架中 **权限（Permission）** 的接入方式，与路由、用户状态、HTTP 层的衔接，以及扩展点。

---

## 1. 权限在架构中的位置

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用入口 main.ts                          │
│  setupStore → app.use(pinia) → app.use(router) → setupPermission │
└─────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  User Store   │         │ Router Guard    │         │  HTTP 拦截器    │
│  roles        │◄───────►│ meta.roles      │         │  Token 注入     │
│  permissions  │         │ meta.permissions│         │  401 → 登出     │
│  hasPermission│         │ 白名单 / 重定向  │         │  Token 来源一致 │
└───────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
                    ┌───────────────────────────────┐
                    │ 视图层：v-permission / 组件   │
                    │ 根据 permissions 控制显隐     │
                    └───────────────────────────────┘
```

- **数据源**：登录后后端返回 `roles`、`permissions`，由 User Store 保存并持久化。
- **路由层**：通过 `beforeEach` 校验 `meta.roles` / `meta.permissions`，未登录或无权时重定向。
- **请求层**：Token 与 User Store 持久化一致；401 时触发登出并可选跳转登录页。
- **视图层**：指令 `v-permission` 或封装组件控制按钮/区域的显隐。

---

## 2. 与现有模块的衔接

### 2.1 User Store（已有）

- **位置**：`src/store/modules/user.ts`
- **已有能力**：
  - `userInfo.roles`、`userInfo.permissions`
  - `hasRole(role)`、`hasPermission(permission)`、`hasAnyPermission(perms)`、`hasAllPermissions(perms)`
  - 持久化 key：`user`
- **权限接入**：无需改 Store 结构；登录/获取用户信息接口需返回 `roles`、`permissions`，并调用 `setUserInfo` 写入。

### 2.2 路由（扩展）

- **位置**：`src/router/index.ts`、`src/router/permission.ts`
- **扩展**：
  - 路由 `meta` 增加可选字段：`roles?: string[]`、`permissions?: string[]`、`requireAuth?: boolean`。
  - 白名单：无需登录即可访问的 path（如 `/login`、`/404`）。
  - `setupPermissionGuard(router)` 在 `beforeEach` 中：
    1. 白名单直接放行；
    2. 需登录且未登录 → 重定向登录（或 403 页）；
    3. 需角色/权限且不满足 → 重定向无权限页或首页。

### 2.3 HTTP 层（修复与扩展）

- **位置**：`src/utils/http.ts`
- **修复**：`getToken()` 与 User Store 持久化一致，从 localStorage 键 `user` 中解析 `token`，保证 Alova 请求头中的 Token 与登录态一致。
- **扩展**：响应拦截中 401 时调用「未授权处理器」（由应用在 `main.ts` 中注册），执行 `userStore.logout()` 并跳转登录页，避免多处耦合。

### 2.4 存储

- Token 与用户状态持久化 key 为 `user`，权限守卫与 HTTP 共用同一套存储。

---

## 3. 路由 Meta 约定

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 页面标题（已有） |
| `requireAuth` | `boolean` | 是否必须登录，默认可由全局配置 |
| `roles` | `string[]` | 允许访问的角色，满足其一即可 |
| `permissions` | `string[]` | 允许访问的权限，满足其一即可（与 roles 同时存在时可按策略「与/或」） |

- 未配置 `roles`/`permissions` 时，仅根据 `requireAuth` 判断是否需登录。
- 配置了 `roles` 或 `permissions` 时，在已登录前提下再校验角色/权限；不满足则重定向无权限页。

---

## 4. 白名单与重定向配置

- **白名单**：在 `permission.ts` 中配置 `WHITE_LIST`（如 `['/login', '/404']`），白名单内路径不校验登录与权限。
- **登录页路径**：如 `/login`，未登录时重定向到此路径。
- **无权限页路径**：如 `/403` 或首页，无权限时重定向到此路径。
- 以上路径建议抽成配置（常量或从 app.config 读取）。

---

## 5. 视图层：v-permission 指令

- **位置**：`src/directives/permission.ts`
- **用法**：`v-permission="'admin:write'"` 或 `v-permission="['admin:write', 'user:read']"`（任意一个满足即显示）。
- **逻辑**：绑定值为字符串则单权限校验，为数组则 `hasAnyPermission`；不满足时从 DOM 上移除或隐藏（如 `el.style.display = 'none'` 或 `el.remove()`）。
- **与角色**：若需「按角色」控制，可使用 `v-role` 或继续用 `v-permission` 配合后端下发的权限码。
- **系统管理权限码**：菜单/部门/字典/角色等权限码及 Mock 中 admin 配置见 [ARCHITECTURE.md](ARCHITECTURE.md)。

---

## 6. 初始化顺序（main.ts）

1. Pinia 创建并 `app.use(pinia)`。
2. `app.use(router)`。
3. 调用 `setupPermissionGuard(router)`，注册路由守卫（守卫内使用 `useUserStore()`，此时 Pinia 已挂载）。
4. 注册 401 处理器：`setUnauthorizedHandler(() => { useUserStore().logout(); router.push('/login'); })`，供 HTTP 层 401 时调用。
5. `app.mount('#app')`。

---

## 7. 与 ARCHITECTURE 的对应

- **状态管理**：权限数据来源于 User Store（ARCHITECTURE §5），持久化 key 已约定。
- **路由**：ARCHITECTURE §4.1 已说明 Vue Router 与 NProgress；权限守卫在现有 `beforeEach` 之前或合并进同一 `beforeEach`，NProgress 与埋点保持不变。
- **请求**：ARCHITECTURE §8.1 的 Token 注入与 401 处理，通过「Token 与 user store 一致」和「未授权处理器」完善。

---

## 8. 登录流程（企业级默认）

- **登录页**：`@/views/Auth/Login.vue`，路由 `/login`，白名单内无需登录可访问。
- **认证 API**：`@/api/auth.ts`（`loginApi`、`getUserInfoApi`、`logoutApi`），Mock 见 `@/mocks/auth.ts`。
- **流程**：登录页提交 → `userStore.login(credentials)` → 调用 `loginApi`（Mock：admin/123456 通过）→ 写入 Token 与 `userInfo`（含 `roles`、`permissions`）→ 跳转 `redirect` 或 `/`。
- **路由守卫**：未登录用户仅能访问白名单（如 `/login`、`/404`），访问其他路径重定向到 `/login?redirect=原路径`；已登录访问 `/login` 时重定向到首页或 `redirect`。
- **401**：HTTP 层收到 401 时调用 `getUnauthorizedHandler()`，执行登出并跳转登录页。

---

## 9. 参考文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 技术架构
- [PINIA_GUIDE.md](./PINIA_GUIDE.md) - 状态管理（User Store）
- [DEVELOPMENT_STANDARDS.md](./DEVELOPMENT_STANDARDS.md) - 开发规范
