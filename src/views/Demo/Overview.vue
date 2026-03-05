<template>
  <!-- min-w-0 使 flex 子项可收缩，避免宽内容撑开整页导致缩小视口时“元素右移” -->
  <div class="demo-overview w-full h-full min-w-0 overflow-auto">
    <!-- 主内容区 100% 宽度、不设 max-width，符合开发规范 -->
    <main class="demo-page__main p-6 w-full min-w-0">
      <h1 class="demo-page__title text-2xl text-gray-800 dark:text-gray-200 mb-2">
        {{ t('demo.title') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-6">
        {{ t('demo.subtitle') }}
      </p>
      <!-- 1. 应用信息 -->
      <el-card :id="'demo-site'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.site') }}</span>
        </template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="应用标识">
            <el-tag type="primary">{{ appName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="应用名称">{{ appConfig?.name }}</el-descriptions-item>
          <el-descriptions-item label="API 地址">{{ appConfig?.api_url ?? '—' }}</el-descriptions-item>
          <el-descriptions-item label="支持语言">{{ supportedLocales }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 2. Element Plus 组件 -->
      <el-card :id="'demo-element'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.element') }}</span>
        </template>
        <div class="flex flex-wrap gap-2 items-center">
          <el-button type="primary" @click="handleClick">Primary</el-button>
          <el-button type="success">Success</el-button>
          <el-button type="info">Info</el-button>
          <el-tag type="warning">UnoCSS + Element</el-tag>
          <el-tag type="danger" effect="dark">单应用样式</el-tag>
        </div>
      </el-card>

      <!-- 3. UnoCSS 工具类 -->
      <el-card :id="'demo-unocss'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.unocss') }}</span>
        </template>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
            flex / grid
          </div>
          <div class="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
            gap / padding
          </div>
          <div class="p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
            responsive
          </div>
          <div class="p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
            单应用样式 (src/styles)
          </div>
        </div>
      </el-card>

      <!-- 4. 图标（Iconify + 本地 SVG） -->
      <el-card :id="'demo-icons'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.icons') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.iconsDesc') }}
        </p>
        <div class="flex flex-wrap gap-4 items-center">
          <span class="text-gray-500 dark:text-gray-400 text-xs">Iconify：</span>
          <Icon icon="mdi:home" width="24" />
          <Icon icon="ep:setting" width="24" />
          <Icon icon="mdi:clock-outline" width="24" />
          <span class="text-gray-500 dark:text-gray-400 text-xs ml-2">本地 SVG：</span>
          <SvgIcon icon-class="sample" class="text-2xl" />
        </div>
      </el-card>

      <!-- 5. 国际化（vue-i18n） -->
      <el-card :id="'demo-i18n'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.i18n') }}</span>
        </template>
        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-gray-600 dark:text-gray-400 text-sm">{{ t('demo.switchLocale') }}：</span>
          <el-radio-group v-model="locale" size="small" @change="handleLocaleChange">
            <el-radio-button v-for="loc in (appConfig?.supportedLocales ?? [])" :key="loc" :value="loc">
              {{ loc }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <p class="mt-3 text-gray-600 dark:text-gray-400 text-sm">
          {{ t('demo.i18nSample', { welcome: t('site.welcome'), save: t('common.save') }) }}
        </p>
      </el-card>

      <!-- 6. Dayjs 日期工具 -->
      <el-card :id="'demo-dayjs'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.dayjs') }}</span>
        </template>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item :label="t('demo.currentTime')">
            {{ nowDisplay }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('demo.formattedDate')">
            {{ formatDate(now) }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('demo.relativeTime')">
            {{ formatRelative(now) }}
          </el-descriptions-item>
        </el-descriptions>
        <p class="mt-2 text-gray-500 dark:text-gray-400 text-xs">
          {{ t('demo.timePageHint') }}
        </p>
      </el-card>

      <!-- 7. Pinia 状态管理 -->
      <el-card :id="'demo-pinia'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.pinia') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.piniaDesc') }}
        </p>
        <el-button type="primary" @click="router.push('/demo/pinia')">
          {{ t('demo.nav.pinia') }}
        </el-button>
      </el-card>

      <!-- 8. 路由与 Nprogress -->
      <el-card :id="'demo-router'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.router') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.routerDesc') }}
        </p>
        <el-button type="primary" @click="goToTimePage">
          {{ t('demo.gotoTimePage') }}
        </el-button>
      </el-card>

      <!-- 9. 数据埋点（Matomo + GrowthBook） -->
      <el-card :id="'demo-analytics'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.analytics') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.analyticsDesc') }}
        </p>
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item :label="t('demo.featureFlag')">
            <el-tag :type="featureFlagOn ? 'success' : 'info'">
              {{ featureFlagOn ? 'ON' : 'OFF' }}
            </el-tag>
            <span class="ml-2 text-gray-500 text-xs">
              （来自 app.config.feature_flags 或 GrowthBook）
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 10. 更新通知（@plugin-web-update-notification） -->
      <el-card :id="'demo-update-notice'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.updateNotice') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.updateNoticeDesc') }}
        </p>
        <div class="flex flex-wrap gap-2 items-center mb-4">
          <el-button type="primary" @click="handleCheckUpdate">
            {{ t('demo.updateNoticeCheck') }}
          </el-button>
          <el-button type="info" @click="showMockNotice = true">
            {{ t('demo.updateNoticeMock') }}
          </el-button>
        </div>
        <div v-if="showMockNotice"
          class="p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <div class="font-medium text-blue-800 dark:text-blue-200 mb-1">
            {{ t('webUpdateNotice.title') }}
          </div>
          <div class="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {{ t('webUpdateNotice.description') }}
          </div>
          <div class="flex gap-2">
            <el-button size="small" @click="showMockNotice = false">
              {{ t('webUpdateNotice.dismissButtonText') }}
            </el-button>
            <el-button type="primary" size="small" @click="handleMockRefresh">
              {{ t('webUpdateNotice.buttonText') }}
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 11. 富文本编辑器（Demo 已移除，可后续接入其他方案） -->
      <el-card :id="'demo-richtext'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.richtext') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.richtextDesc') }}
        </p>
        <el-button type="primary" @click="router.push('/demo/richtext')">
          {{ t('demo.nav.richtext') }}
        </el-button>
      </el-card>

      <!-- 11.5 表单校验 -->
      <el-card :id="'demo-form-validation'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.formValidation') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.formValidation.subtitle') }}
        </p>
        <el-button type="primary" @click="router.push('/demo/form-validation')">
          {{ t('demo.nav.formValidation') }}
        </el-button>
      </el-card>

      <!-- 12. 安全渲染（vue-dompurify-html + DOMPurify） -->
      <el-card :id="'demo-safe-render'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.safeRender') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.safeRenderDesc') }}
        </p>
        <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
          v-dompurify-html="SAFE_RENDER_SAMPLE_HTML" />
      </el-card>

      <!-- 13. 权限（路由守卫 + v-permission） -->
      <el-card :id="'demo-permission'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.permission') }}</span>
        </template>
        <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {{ t('demo.permissionDesc') }}
        </p>
        <el-button type="primary" @click="router.push('/system/menu')">
          {{ t('layout.menu.menuManage') }}
        </el-button>
      </el-card>

      <!-- 14. 网络请求（Alova + MSW Mock） -->
      <el-card :id="'demo-network'" class="demo-page__section scroll-mt-4" shadow="hover">
        <template #header>
          <span class="font-semibold">{{ t('demo.sections.network') }}</span>
        </template>
        <div class="flex flex-wrap gap-2 demo-page__card-footer">
          <el-button type="primary" :loading="loading.health" @click="fetchHealth">
            健康检查 GET /api/health
          </el-button>
          <el-button type="success" :loading="loading.user" @click="fetchUser">
            用户信息 GET /api/user/me
          </el-button>
          <el-button type="warning" :loading="loading.params" @click="fetchParams">
            带参请求 GET /api/demo/params（qs 序列化）
          </el-button>
        </div>
        <div v-if="requestError" class="mt-4">
          <el-alert type="error" :title="requestError" show-icon closable />
        </div>
        <div v-if="requestResult" class="mt-4">
          <div class="text-gray-500 dark:text-gray-400 text-sm mb-1">响应结果：</div>
          <pre class="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm overflow-x-auto">{{ requestResult }}</pre>
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'demo-overview' });
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getAppConfig } from '@/utils/appConfig';
import dayjs, {
  setDayjsLocale,
  formatDate,
  formatRelative,
} from '@/utils/dayjs';
import { getGrowthBook } from '@/utils/analytics';
import { getHealth, getUserMe, getDemoParams } from '@/api/demo';

const { t, locale } = useI18n();
const router = useRouter();
const appName = 'admin';
/** 安全渲染示例 HTML（不放入 i18n，避免 vue-i18n 的 HTML 检测告警；经 v-dompurify-html 过滤后渲染） */
const SAFE_RENDER_SAMPLE_HTML =
  '<strong>粗体</strong>、<a href="https://example.com">链接</a>';
const appConfig = getAppConfig();
const supportedLocales = computed(() => (appConfig?.supportedLocales ?? []).join('、') || '—');

function handleLocaleChange(val: string | number | boolean | undefined): void {
  onLocaleChange(String(val ?? ''));
}
function onLocaleChange(value: string): void {
  setDayjsLocale(value);
}

const now = ref(dayjs());
const nowDisplay = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
let nowTimer: ReturnType<typeof setInterval> | null = null;
onMounted(() => {
  nowTimer = setInterval(() => {
    now.value = dayjs();
    nowDisplay.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
  }, 1000);
});
onUnmounted(() => {
  if (nowTimer) clearInterval(nowTimer);
});

const featureFlagOn = computed(() => {
  const gb = getGrowthBook();
  if (gb) return gb.isOn('showLegacyFeature');
  return appConfig?.feature_flags?.showLegacyFeature ?? false;
});

function goToTimePage() {
  router.push('/demo/time');
}

const loading = ref({ health: false, user: false, params: false });
const requestResult = ref<string | null>(null);
const requestError = ref<string | null>(null);

function clearResult() {
  requestResult.value = null;
  requestError.value = null;
}

function handleClick() {
  ElNotification.success({ message: 'Element Plus 按需引入验证成功！' });
}

const showMockNotice = ref(false);
function handleCheckUpdate() {
  const api = (globalThis as unknown as Window).pluginWebUpdateNotice_;
  if (api) {
    api.checkUpdate();
    ElNotification.info({ message: '已触发检查，若服务端版本有更新将弹出通知（生产环境生效）' });
  } else {
    ElNotification.info({ message: '开发环境下插件未注入，请使用生产构建（npm run build:prod）后查看实际通知效果' });
  }
}
function handleMockRefresh() {
  showMockNotice.value = false;
  ElNotification.success({ message: '已模拟刷新（演示用，未真正刷新页面）' });
}

async function fetchHealth() {
  clearResult();
  loading.value.health = true;
  try {
    const res = await getHealth();
    requestResult.value = JSON.stringify(res, null, 2);
  } catch (e) {
    requestError.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value.health = false;
  }
}

async function fetchUser() {
  clearResult();
  loading.value.user = true;
  try {
    const res = await getUserMe();
    requestResult.value = JSON.stringify(res, null, 2);
  } catch (e) {
    requestError.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value.user = false;
  }
}

async function fetchParams() {
  clearResult();
  loading.value.params = true;
  try {
    const res = await getDemoParams({
      ids: [1, 2, 3],
      filter: { role: 'admin', status: 'active' },
    });
    requestResult.value = JSON.stringify(res, null, 2);
  } catch (e) {
    requestError.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value.params = false;
  }
}
</script>

<style lang="scss" scoped>
@use 'styles/demo.scss' as *;
</style>
