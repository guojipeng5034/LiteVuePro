<h1 align="center">LiteVuePro</h1>

<p align="center">
  <strong>轻量级企业管理端前端框架</strong><br>
  Vue 3 + TypeScript + Vite 8 + Element Plus + Pinia + UnoCSS
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js&logoColor=white" alt="Vue 3.5">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.9">
  <img src="https://img.shields.io/badge/Vite-8_(Rolldown)-646cff?logo=vite&logoColor=white" alt="Vite 8">
  <img src="https://img.shields.io/badge/Element_Plus-2.13-409eff?logo=element&logoColor=white" alt="Element Plus">
  <img src="https://img.shields.io/badge/Pinia-3.x-ffd859?logo=pinia&logoColor=white" alt="Pinia 3">
  <img src="https://img.shields.io/badge/UnoCSS-66-333?logo=unocss&logoColor=white" alt="UnoCSS">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

<p align="center">
  <a href="./README.en.md">English</a> | 中文
</p>

---

## 简介

LiteVuePro 是一套**开箱即用**的 Vue 3 企业级管理端前端框架，采用单应用架构，内置完整的后台管理系统所需能力：

- 多布局模式（侧边栏 + 顶栏 + Tab 页签）
- 动态路由与权限控制（角色 / 细粒度权限）
- 国际化（i18n）
- 亮色 / 暗色主题切换
- 请求层封装（Alova + Token 刷新 + 统一错误处理）
- MSW Mock 数据（开发环境零后端依赖）
- 表单验证（VeeValidate + Zod）
- 富文本编辑器、日历组件、图标选择器等业务组件

> **适用场景**：中后台管理系统、运营平台、SaaS 管理端等。

---

## 预览

<!-- 如果有在线预览地址，取消注释并替换 URL -->
<!-- **在线演示**：[https://demo.example.com](https://demo.example.com) -->

| 亮色主题 | 暗色主题 |
|---------|---------|
| ![light](https://via.placeholder.com/600x340?text=Light+Theme) | ![dark](https://via.placeholder.com/600x340?text=Dark+Theme) |

> 替换为实际截图后效果更佳。

---

## 特性

| 分类 | 说明 |
|------|------|
| **技术栈** | Vue 3.5 + TypeScript 5.9 + Vite 8 (Rolldown) |
| **UI 框架** | Element Plus 2.x（按需自动导入） |
| **状态管理** | Pinia 3.x + 持久化插件 |
| **样式方案** | UnoCSS 原子类 + Sass |
| **路由** | Vue Router 4.x，History 模式，NProgress 进度条 |
| **请求** | Alova 3.x，全局拦截、Token 自动刷新 |
| **Mock** | MSW 2.x，Service Worker 拦截，无需后端即可开发 |
| **国际化** | vue-i18n 10.x，支持中文 / English |
| **表单** | VeeValidate + Zod 声明式校验 |
| **富文本** | TinyMCE 8.x 集成 |
| **主题** | 亮色 / 暗色一键切换，全局 CSS 变量 |
| **权限** | 路由级（meta.roles / permissions） + 按钮级（v-permission） |
| **错误处理** | ErrorBoundary 组件 + 全局异常捕获 |

---

## 快速开始

### 环境要求

- **Node.js** >= 22
- **pnpm** >= 8（推荐）

### 安装 & 启动

```bash
# 克隆项目
git clone https://github.com/guojipeng5034/LiteVuePro.git
cd LiteVuePro

# 安装依赖
pnpm install

# 启动开发服务器（内置 MSW Mock，无需后端）
pnpm run dev

# 构建生产版本
pnpm run build:prod
```

启动后访问 `http://localhost:3000`，使用默认账号 `admin / 123456` 登录（Mock 数据）。

---

## 项目结构

```
LiteVuePro/
├── public/                  # 静态资源
├── src/
│   ├── api/                 # API 接口（按模块划分）
│   ├── components/          # 通用业务组件
│   │   ├── BusinessCalendar/  # 日历组件
│   │   ├── TinyMCE/           # 富文本编辑器
│   │   ├── Icon/              # 图标选择器
│   │   ├── ErrorBoundary/     # 错误边界
│   │   ├── StepFormContainer/ # 分步表单
│   │   └── ...
│   ├── layout/              # 布局骨架
│   │   ├── Index.vue          # 主布局
│   │   ├── AppSidebar/        # 侧边栏
│   │   ├── AppHeader/         # 顶栏
│   │   └── TabNav/            # 标签页导航
│   ├── locales/             # 国际化语言包
│   ├── mocks/               # MSW Mock 数据
│   ├── router/              # 路由配置 & 权限守卫
│   ├── store/               # Pinia 状态管理
│   ├── styles/              # 全局样式
│   ├── utils/               # 工具函数
│   ├── views/               # 页面视图
│   │   ├── Auth/              # 登录
│   │   ├── Home/              # 首页
│   │   ├── System/            # 系统管理（用户/角色/菜单/部门/字典/区域）
│   │   ├── Demo/              # 演示页面
│   │   └── Errors/            # 错误页（403/404）
│   ├── app.config.ts        # 应用配置入口
│   └── main.ts              # 应用入口
├── docs/                    # 项目文档
├── .env.dev                 # 开发环境变量（示例）
├── index.html               # HTML 入口
├── vite.config.ts           # Vite 配置
├── package.json
└── README.md
```

---

## 内置页面

| 模块 | 页面 | 说明 |
|------|------|------|
| 登录 | Login | 账号密码登录 |
| 首页 | Home | 仪表盘 |
| 系统管理 | 用户管理 | CRUD、角色分配 |
| | 角色管理 | 角色 CRUD、菜单权限分配、数据权限 |
| | 菜单管理 | 树形菜单 CRUD |
| | 部门管理 | 部门树 CRUD |
| | 字典管理 | 字典类型 + 字典数据 |
| | 区域管理 | 区域 CRUD |
| 演示 | Demo | 富文本、日历、表单验证、Pinia 等演示 |
| 错误页 | 403 / 404 | 权限不足 / 页面未找到 |

---

## 配置说明

### 应用配置

编辑 `src/app.config.ts` 进行应用级配置：

```ts
const config: AppConfig = {
  api_url: 'https://api.example.com',  // 后端 API 地址
  enableMsw: true,                      // 是否启用 MSW Mock
  supportedLocales: ['zh-CN', 'en'],    // 支持的语言
  defaultLocale: 'zh-CN',               // 默认语言
  tabNav: {
    showTabNav: true,                   // 是否显示 Tab 页签
    enablePageCache: true,              // 是否启用 keep-alive 缓存
  },
};
```

### 环境变量

复制 `.env.dev` 为 `.env.local` 进行本地开发配置：

```bash
cp .env.dev .env.local
```

```env
VITE_BASE_URL=https://your-api.com
VITE_PROXY_TARGET=http://localhost:8080  # 本地后端代理（可选）
```

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 技术架构总览 |
| [docs/DEVELOPMENT_STANDARDS.md](docs/DEVELOPMENT_STANDARDS.md) | 开发规范 |
| [docs/PERMISSION.md](docs/PERMISSION.md) | 权限模块详解 |
| [docs/PINIA_GUIDE.md](docs/PINIA_GUIDE.md) | Pinia 状态管理指南 |

---

## 开发指南

### 新增页面

1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/` 中添加路由配置
3. 在 `src/api/` 中定义接口
4. 在 `src/mocks/` 中添加 Mock 数据
5. 需要缓存的页面添加 `defineOptions({ name: '路由name' })`

### 权限控制

```vue
<!-- 路由级：在路由 meta 中配置 -->
meta: { roles: ['admin'], permissions: ['user:create'] }

<!-- 按钮级：使用 v-permission 指令 -->
<el-button v-permission="'user:delete'">删除</el-button>
```

### Mock 数据

项目使用 MSW 进行 API Mock，开发时无需启动后端服务：

```ts
// src/mocks/xxx.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/xxx', () => {
    return HttpResponse.json({ code: 0, data: [...] })
  }),
]
```

---

## 构建 & 部署

```bash
# 开发环境构建
pnpm run build:dev

# 测试环境构建
pnpm run build:test

# 生产环境构建
pnpm run build:prod
```

构建产物输出到 `dist/` 目录，可直接部署到 Nginx 等静态服务器。

Nginx 参考配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend:8080;
    }
}
```

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 提交 Pull Request

请确保代码符合 [开发规范](docs/DEVELOPMENT_STANDARDS.md)。

---

## License

[MIT](LICENSE) &copy; LiteVuePro

---

## 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vite.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [UnoCSS](https://unocss.dev/)
- [Alova](https://alova.js.org/)
- [MSW](https://mswjs.io/)
- [TinyMCE](https://www.tiny.cloud/)
