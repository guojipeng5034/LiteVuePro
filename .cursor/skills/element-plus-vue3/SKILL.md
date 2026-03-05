---
name: element-plus-vue3
description: Provides guidance for Element Plus Vue 3 component library including installation, components, themes, internationalization, and API. Use when working with Element Plus in Vue 3, building Vue 3 UIs with Element Plus, or customizing component styles.
---

## When to use this skill

Use this skill whenever the user wants to:
- Install and set up Element Plus in a Vue 3 project
- Use Element Plus components in Vue 3 applications
- Configure Element Plus (global config, i18n, theme)
- Use form components (Button, Input, Form, etc.)
- Use data display components (Table, Card, etc.)
- Use feedback components (Message, Notification, Dialog, etc.)
- Use navigation components (Menu, Tabs, etc.)
- Customize component styles and themes
- Handle component events or understand Element Plus API
- Troubleshoot Element Plus issues

## Understanding Element Plus

Element Plus is a Vue 3 component library that provides a rich set of UI components following Element Design principles.

**Key concepts**:
- **Vue 3 only**: Built for Vue 3 with Composition API
- **Design system**: Follows Element Design language
- **Rich components**: 60+ components (forms, data display, feedback, navigation)
- **Theme**: CSS variables and theme customization
- **i18n**: Internationalization support
- **TypeScript**: Full TypeScript support

## Installation

**npm**:
```bash
npm install element-plus
```

**yarn**:
```bash
yarn add element-plus
```

**pnpm**:
```bash
pnpm add element-plus
```

## Basic setup

**Full import**:
```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

**On-demand import** (recommended for smaller bundles):
```javascript
import { ElButton, ElInput } from 'element-plus'
import 'element-plus/es/components/button/style/css'
import 'element-plus/es/components/input/style/css'
```

For Vite, use unplugin-vue-components + unplugin-auto-import to auto-import components and styles; see [Element Plus Quick Start](https://element-plus.org/en-US/guide/quickstart.html).

## Component and doc reference

For component usage, props, events, and examples, use the official docs (structure matches below):

- **Guide**: Design, i18n, theme, global config → https://element-plus.org/en-US/guide/design
- **Components**: Button, Input, Form, Table, Card, Dialog, Message, Notification, Menu, Tabs, DatePicker, Select, Switch, Checkbox, Radio, Upload, Pagination, Tree, TreeSelect, Transfer, Descriptions, Avatar, Badge, Tag, Empty, Loading, Popover, Tooltip, Dropdown, Drawer, Popconfirm → https://element-plus.org/en-US/component/overview

When helping with a specific component, open the corresponding component page on the site above for syntax, props, events, and slots.

## Best practices

1. **On-demand import**: Import only the components you need to reduce bundle size.
2. **Composition API**: Prefer Composition API for clearer organization.
3. **Events**: Use the documented events (e.g. `@change`, `@submit`) for component interactions.
4. **Theme**: Customize via theme variables or ConfigProvider instead of ad-hoc overrides when possible.
5. **Design specs**: Follow Element Design specifications for consistency.
6. **TypeScript**: Use TypeScript and official types for type safety.

## Resources

- **Official (CN)**: https://element-plus.org/zh-CN/
- **Official (EN)**: https://element-plus.org/en-US/
- **Design**: https://element-plus.org/en-US/guide/design
- **Component overview**: https://element-plus.org/en-US/component/overview
- **GitHub**: https://github.com/element-plus/element-plus

## Keywords

Element Plus, element-plus, Vue 3, Vue3, UI components, component library, 组件库, Button, Form, Table, Dialog, Message, Notification, Menu, Tabs, DatePicker, Select, Switch, Checkbox, Radio, Upload, Pagination, Tree, Transfer, Descriptions, Avatar, Badge, Tag, Empty, Loading, Popover, Tooltip, Dropdown, Drawer, Popconfirm
