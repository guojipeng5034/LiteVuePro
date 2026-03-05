import '@unocss/reset/normalize.css';
import 'virtual:uno.css';
import 'virtual:svg-icons-register';
import '@/assets/css/style.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import '@/assets/css/theme-element-overrides.css';
import { createApp } from 'vue';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import { Icon } from '@iconify/vue';
import App from './App.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import IconSelect from '@/components/Icon/src/IconSelect.vue';
import { getAppConfig } from '@/utils/appConfig';
import { setupI18n } from '@/utils/i18n';
import { setDayjsLocale } from '@/utils/dayjs';
import { dompurifyDirectiveConfig } from '@/utils/dompurify';
import { permission as vPermission } from '@/directives/permission';
import router from '@/router';
import { setupPermissionGuard, setUnauthorizedHandler } from '@/router/permission';
import { initAnalytics } from '@/utils/analytics';
import { initErrorReport } from '@/utils/errorReport';
import { initWebUpdateNotice } from '@/utils/webUpdateNotice';
import { setupStore } from '@/store';
import { useUserStore } from '@/store/modules/user';
import { piniaLogger } from '@/store/plugins/logger';
import { piniaAnalytics } from '@/store/plugins/analytics';

/** 启用 MSW mock，当 appConfig.enableMsw 为 true 时 */
async function enableMocking(): Promise<void> {
  const appConfig = getAppConfig();
  if (!appConfig?.enableMsw) return;
  const { worker, workerStartOptions } = await import('./mocks/browser');
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  await worker.start({
    serviceWorker: { url: `${base}mockServiceWorker.js` },
    ...workerStartOptions,
    quiet: import.meta.env.PROD,
  });
}

await enableMocking();

const i18n = await setupI18n();
const locale = i18n.global.locale;
setDayjsLocale(typeof locale === 'string' ? locale : locale.value);

// 初始化 Pinia Store
const pinia = setupStore();
pinia.use(piniaLogger({ logActions: true, logState: false }));
pinia.use(piniaAnalytics({ 
  enabled: import.meta.env.PROD,
  include: ['user'],
  trackActions: ['user.login', 'user.logout'],
}));

const app = createApp(App);

// Vue 全局错误处理（捕获 component 等 update 错误）
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue errorHandler]', info, err);
};

app.component('Icon', Icon);
app.component('SvgIcon', SvgIcon);
app.component('IconSelect', IconSelect);
app.use(VueDOMPurifyHTML, dompurifyDirectiveConfig);
app.directive('permission', vPermission);
app.use(pinia);
app.use(i18n);
app.use(router);

// 设置权限守卫（pinia 与 router 挂载后）
setupPermissionGuard(router);
setUnauthorizedHandler(() => {
  useUserStore().logout();
  router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } });
});

// 初始化 appStore（需 store 就绪后）
const { useAppStore } = await import('@/store/modules/app');
const appStore = useAppStore();
appStore.initApp();

// 从 appStore 同步语言到 i18n
const appLocale = appStore.locale;
locale.value = appLocale;
setDayjsLocale(appLocale);

initWebUpdateNotice(typeof locale === 'string' ? locale : locale.value);

// 尽早初始化错误上报（Promise rejection）
initErrorReport();

// 先 mount 再处理 Loading、initAnalytics / featureFlags
app.mount('#app');

// 初始化分析/埋点
void initAnalytics();
const { useFeatureFlagsStore } = await import('@/store/modules/featureFlags');
void useFeatureFlagsStore().init();
// 初始化服务端时间
const { init: initServerTime } = await import('@/utils/serverTime');
void initServerTime();
