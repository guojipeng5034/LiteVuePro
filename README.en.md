<h1 align="center">LiteVuePro</h1>

<p align="center">
  <strong>Lightweight Enterprise Admin Frontend Framework</strong><br>
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
  English | <a href="./README.md">中文</a>
</p>

---

## Introduction

LiteVuePro is a **ready-to-use** Vue 3 enterprise-grade admin frontend framework with a single-application architecture, featuring everything needed for a complete admin system:

- Multiple layout modes (Sidebar + Header + Tab Navigation)
- Dynamic routing & permission control (Role-based / Fine-grained permissions)
- Internationalization (i18n)
- Light / Dark theme switching
- Request layer encapsulation (Alova + Token refresh + Unified error handling)
- MSW Mock data (Zero backend dependency in development)
- Form validation (VeeValidate + Zod)
- Rich text editor, calendar component, icon picker, and more business components

> **Use cases**: Admin dashboards, operations platforms, SaaS management consoles, etc.

---

## Preview

<!-- Uncomment and replace URL if you have an online preview -->
<!-- **Live Demo**: [https://demo.example.com](https://demo.example.com) -->

| Light Theme | Dark Theme |
|-------------|------------|
| ![light](https://via.placeholder.com/600x340?text=Light+Theme) | ![dark](https://via.placeholder.com/600x340?text=Dark+Theme) |

> Replace with actual screenshots for a better presentation.

---

## Features

| Category | Description |
|----------|-------------|
| **Tech Stack** | Vue 3.5 + TypeScript 5.9 + Vite 8 (Rolldown) |
| **UI Framework** | Element Plus 2.x (auto-import on demand) |
| **State Management** | Pinia 3.x + Persistence plugin |
| **Styling** | UnoCSS atomic classes + Sass |
| **Routing** | Vue Router 4.x, History mode, NProgress progress bar |
| **HTTP Client** | Alova 3.x, global interceptors, automatic Token refresh |
| **Mock** | MSW 2.x, Service Worker interception, develop without a backend |
| **i18n** | vue-i18n 10.x, supports Chinese / English |
| **Forms** | VeeValidate + Zod declarative validation |
| **Rich Text** | TinyMCE 8.x integration |
| **Themes** | Light / Dark toggle, global CSS variables |
| **Permissions** | Route-level (meta.roles / permissions) + Button-level (v-permission) |
| **Error Handling** | ErrorBoundary component + Global exception capture |

---

## Quick Start

### Requirements

- **Node.js** >= 22
- **pnpm** >= 8 (recommended)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/guojipeng5034/LiteVuePro.git
cd LiteVuePro

# Install dependencies
pnpm install

# Start dev server (with built-in MSW Mock, no backend needed)
pnpm run dev

# Build for production
pnpm run build:prod
```

After starting, visit `http://localhost:3000` and log in with the default account `admin / 123456` (Mock data).

---

## Project Structure

```
LiteVuePro/
├── public/                  # Static assets
├── src/
│   ├── api/                 # API endpoints (organized by module)
│   ├── components/          # Shared business components
│   │   ├── BusinessCalendar/  # Calendar component
│   │   ├── TinyMCE/           # Rich text editor
│   │   ├── Icon/              # Icon picker
│   │   ├── ErrorBoundary/     # Error boundary
│   │   ├── StepFormContainer/ # Step form
│   │   └── ...
│   ├── layout/              # Layout shell
│   │   ├── Index.vue          # Main layout
│   │   ├── AppSidebar/        # Sidebar
│   │   ├── AppHeader/         # Header
│   │   └── TabNav/            # Tab navigation
│   ├── locales/             # i18n language packs
│   ├── mocks/               # MSW Mock data
│   ├── router/              # Route config & permission guards
│   ├── store/               # Pinia state management
│   ├── styles/              # Global styles
│   ├── utils/               # Utility functions
│   ├── views/               # Page views
│   │   ├── Auth/              # Login
│   │   ├── Home/              # Home / Dashboard
│   │   ├── System/            # System management (User/Role/Menu/Department/Dictionary/Region)
│   │   ├── Demo/              # Demo pages
│   │   └── Errors/            # Error pages (403/404)
│   ├── app.config.ts        # App configuration entry
│   └── main.ts              # App entry point
├── docs/                    # Project documentation
├── .env.dev                 # Dev environment variables (example)
├── index.html               # HTML entry
├── vite.config.ts           # Vite configuration
├── package.json
└── README.md
```

---

## Built-in Pages

| Module | Page | Description |
|--------|------|-------------|
| Auth | Login | Username & password login |
| Home | Dashboard | Dashboard overview |
| System | User Management | CRUD, role assignment |
| | Role Management | Role CRUD, menu permission assignment, data scope |
| | Menu Management | Tree-structured menu CRUD |
| | Department Management | Department tree CRUD |
| | Dictionary Management | Dictionary type + dictionary data |
| | Region Management | Region CRUD |
| Demo | Demo | Rich text, calendar, form validation, Pinia demos |
| Errors | 403 / 404 | Forbidden / Not found |

---

## Configuration

### App Configuration

Edit `src/app.config.ts` for application-level settings:

```ts
const config: AppConfig = {
  api_url: 'https://api.example.com',  // Backend API URL
  enableMsw: true,                      // Enable MSW Mock
  supportedLocales: ['zh-CN', 'en'],    // Supported languages
  defaultLocale: 'zh-CN',               // Default language
  tabNav: {
    showTabNav: true,                   // Show tab navigation
    enablePageCache: true,              // Enable keep-alive cache
  },
};
```

### Environment Variables

Copy `.env.dev` to `.env.local` for local development:

```bash
cp .env.dev .env.local
```

```env
VITE_BASE_URL=https://your-api.com
VITE_PROXY_TARGET=http://localhost:8080  # Local backend proxy (optional)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture overview |
| [docs/DEVELOPMENT_STANDARDS.md](docs/DEVELOPMENT_STANDARDS.md) | Development standards |
| [docs/PERMISSION.md](docs/PERMISSION.md) | Permission module guide |
| [docs/PINIA_GUIDE.md](docs/PINIA_GUIDE.md) | Pinia state management guide |

---

## Development Guide

### Adding a New Page

1. Create a page component under `src/views/`
2. Add route configuration in `src/router/`
3. Define API endpoints in `src/api/`
4. Add Mock data in `src/mocks/`
5. For cached pages, add `defineOptions({ name: 'RouteName' })`

### Permission Control

```vue
<!-- Route-level: configure in route meta -->
meta: { roles: ['admin'], permissions: ['user:create'] }

<!-- Button-level: use v-permission directive -->
<el-button v-permission="'user:delete'">Delete</el-button>
```

### Mock Data

The project uses MSW for API mocking — no backend service needed during development:

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

## Build & Deploy

```bash
# Development build
pnpm run build:dev

# Staging build
pnpm run build:test

# Production build
pnpm run build:prod
```

Build output goes to the `dist/` directory and can be deployed to Nginx or any static file server.

Nginx reference configuration:

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

## Contributing

Issues and Pull Requests are welcome!

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a Pull Request

Please ensure your code follows the [Development Standards](docs/DEVELOPMENT_STANDARDS.md).

---

## License

[MIT](LICENSE) &copy; LiteVuePro

---

## Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Vite](https://vite.dev/)
- [Element Plus](https://element-plus.org/)
- [Pinia](https://pinia.vuejs.org/)
- [UnoCSS](https://unocss.dev/)
- [Alova](https://alova.js.org/)
- [MSW](https://mswjs.io/)
- [TinyMCE](https://www.tiny.cloud/)
