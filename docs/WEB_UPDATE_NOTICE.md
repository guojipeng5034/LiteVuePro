# 更新通知模块

基于 `@plugin-web-update-notification/vite` 封装的**可配置更新通知**，支持默认样式、自定义回调与埋点，适用于企业级管理端框架。

## 能力概览

- **构建时**：Vite 插件轮询 `version.json`，检测到新版本后触发通知
- **默认 UI**：插件自带右下角通知条（标题、描述、刷新/暂不按钮），可配置颜色与位置
- **多语言**：通过 `initWebUpdateNotice(i18nLocale)` 与 i18n 同步，或使用 Vite 配置中的 `locale` / `localeData`
- **自定义回调**：`onUpdateDetected`、`onRefresh`、`onDismiss` 可做自定义逻辑
- **埋点**：与 `@/utils/analytics` 集成，自动上报 Matomo 事件（`web_update_notice` 分类下的 `shown` / `refresh` / `dismiss`）

## 一、配置模板

### 1. 构建时配置（Vite）

在 `vite.config.ts` 中，生产构建会注入 `webUpdateNotice` 插件，可按需修改默认值：

```ts
// vite.config.ts
webUpdateNotice({
  versionType: 'pkg_version',           // 版本来源：pkg_version | git_commit_hash | build_timestamp | custom
  customVersion: undefined,             // versionType 为 custom 时必填
  checkInterval: 10 * 60 * 1000,        // 轮询间隔（ms），0 表示不轮询
  checkOnWindowFocus: true,
  checkImmediately: true,
  checkOnLoadFileError: true,
  logVersion: true,                     // 控制台输出当前版本
  hiddenDefaultNotification: false,      // true 时隐藏默认 UI，需自行监听 plugin_web_update_notice
  hiddenDismissButton: false,
  injectFileBase: './',                 // 与 Vite base 一致，非根部署时需对应修改
  locale: 'zh_CN',                      // 预设：zh_CN | zh_TW | en_US
  localeData: undefined,               // 自定义多语言文案
  notificationConfig: {
    primaryColor: '#1677ff',
    secondaryColor: 'rgba(0,0,0,.25)',
    placement: 'bottomRight',           // topLeft | topRight | bottomLeft | bottomRight
  },
  notificationProps: {
    title: '系统更新',
    description: '系统已更新，请刷新页面以获取最新版本',
    buttonText: '刷新',
    dismissButtonText: '暂不',
  },
})
```

非根路径部署时，`injectFileBase` 需与 `base` 一致（如 `base: '/app/'` 则 `injectFileBase: '/app/'`）。

### 2. 运行时配置（应用内）

默认配置在 `src/config/webUpdateNotice.ts`，可扩展或覆盖：

```ts
// src/config/webUpdateNotice.ts
export interface WebUpdateNoticeConfig {
  analytics?: boolean;
  onUpdateDetected?: (detail: { version: string; options?: unknown }) => void;
  onRefresh?: (version: string) => void;
  onDismiss?: (version: string) => void;
}

export function getWebUpdateNoticeConfig(): WebUpdateNoticeConfig {
  return {
    analytics: true,
    // 按需添加 onUpdateDetected / onRefresh / onDismiss
  };
}
```

初始化在 `src/main.ts` 中完成，并传入当前 i18n locale 以同步插件语言：

```ts
import { initWebUpdateNotice } from '@/utils/webUpdateNotice';

const locale = i18n.global.locale;
initWebUpdateNotice(typeof locale === 'string' ? locale : locale.value);
```

需要覆盖配置时，可传入第二参数：

```ts
initWebUpdateNotice(locale, {
  analytics: true,
  onUpdateDetected: ({ version }) => console.log('New version:', version),
  onRefresh: (version) => { /* 刷新前逻辑 */ },
  onDismiss: (version) => { /* 忽略逻辑 */ },
});
```

## 二、使用示例

### 示例 1：仅使用默认行为（默认 UI + 埋点）

无需额外代码，只要完成上述「配置模板」中的 Vite 与 main 初始化即可。切换语言后如需同步通知文案，可调用：

```ts
window.pluginWebUpdateNotice_?.setLocale('zh_CN'); // 或 en_US、zh_TW
```

### 示例 2：自定义回调（例如打日志、上报其他系统）

```ts
// main.ts 或单独模块
import { initWebUpdateNotice } from '@/utils/webUpdateNotice';

initWebUpdateNotice(i18nLocale, {
  analytics: true,
  onUpdateDetected: ({ version }) => {
    console.log('[Update] New version detected:', version);
  },
  onRefresh: (version) => {
    console.log('[Update] User chose refresh:', version);
    // 可在此上报到自有监控
  },
  onDismiss: (version) => {
    console.log('[Update] User dismissed:', version);
  },
});
```

### 示例 3：隐藏默认 UI，完全自定义通知

1. 在 Vite 配置中设置 `hiddenDefaultNotification: true`。
2. 在应用内监听事件并展示自己的 UI：

```ts
document.body.addEventListener('plugin_web_update_notice', ((e: CustomEvent<{ version: string }>) => {
  const { version } = e.detail;
  // 使用 Element Plus Message、自定义 Modal 等
  ElMessage.info(`发现新版本 ${version}，请刷新页面`);
  // 仍可使用埋点
  trackMatomoEvent('web_update_notice', 'shown', version);
}) as EventListener);
```

手动刷新/忽略时调用：

```ts
window.pluginWebUpdateNotice_?.dismissUpdate(); // 忽略
// 刷新：location.reload() 或 window.pluginWebUpdateNotice_.onClickRefresh?.(version) 后 reload
```

### 示例 4：与 i18n 联动（切换语言时更新通知文案）

应用内切换语言后，同步插件语言：

```ts
// 例如在语言切换的 composable 或 layout 中
import { i18n } from '@/utils/i18n';

const localeMap: Record<string, string> = {
  'zh-CN': 'zh_CN',
  'en': 'en_US',
  'zh-TW': 'zh_TW',
};
function syncUpdateNoticeLocale() {
  const locale = typeof i18n.global.locale === 'string' ? i18n.global.locale : i18n.global.locale.value;
  window.pluginWebUpdateNotice_?.setLocale(localeMap[locale] ?? 'en_US');
}
// 在切换 locale 时调用 syncUpdateNoticeLocale()
```

## 三、埋点说明

当 `config.analytics === true`（默认）时，会通过 `trackMatomoEvent` 上报到 Matomo：

| 事件       | category           | action   | name（可选） |
|------------|--------------------|----------|--------------|
| 更新被检测 | `web_update_notice`| `shown`  | 新版本号     |
| 用户点击刷新 | `web_update_notice`| `refresh`| 版本号       |
| 用户点击暂不 | `web_update_notice`| `dismiss`| 版本号       |

Matomo 自定义事件需在后台配置相应维度/报表方可分析。

## 四、样式覆盖

插件会注入默认样式，如需覆盖（如与项目主题统一），可用更高优先级选择器在全局样式中覆盖，例如在 `src/assets/css/style.css` 或项目样式文件中：

```css
/* 覆盖更新通知主色与位置示例 */
#plugin-web-update-notification-root .plugin-web-update-notification-button-primary {
  background-color: var(--el-color-primary);
}
#plugin-web-update-notification-root {
  font-family: var(--your-font);
}
```

默认 DOM 结构及类名以插件仓库 [webUpdateNoticeInjectStyle.css](https://github.com/GreatAuk/plugin-web-update-notification/blob/main/packages/core/public/webUpdateNoticeInjectStyle.css) 为准。

## 五、版本文件与构建

- 构建前脚本 `scripts/update-version-json.js` 会往 `public/version.json` 写入 `package.json` 的 `version`，构建后该文件会出现在输出目录，供插件轮询。
- 插件使用 `versionType: 'pkg_version'` 时与上述版本一致；若使用 `git_commit_hash` 或 `build_timestamp`，插件会在构建时生成自己的版本信息并写入输出目录的 `version.json`，此时可不再依赖预写的 `public/version.json`，或按需二选一。

建议生产环境对 `index.html` 禁用强缓存，避免更新后仍命中旧页面，详见插件文档（如 Nginx 对 `index.html` 设置 `Cache-Control: no-cache, no-store, must-revalidate`）。

## 六、API 速查

| 方法 | 说明 |
|------|------|
| `window.pluginWebUpdateNotice_.setLocale(locale)` | 设置语言：`zh_CN` / `zh_TW` / `en_US` |
| `window.pluginWebUpdateNotice_.checkUpdate()` | 手动检查更新（带 5s 防抖） |
| `window.pluginWebUpdateNotice_.dismissUpdate()` | 忽略当前更新并关闭通知 |
| `window.pluginWebUpdateNotice_.closeNotification()` | 仅关闭通知浮层 |

事件：`document.body` 上监听 `plugin_web_update_notice`，`e.detail` 为 `{ version, options }`。
