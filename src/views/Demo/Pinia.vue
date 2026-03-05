<template>
  <div class="pinia-demo-container w-full h-full overflow-auto">
    <div class="pinia-demo__content w-full p-6">
      <h1 class="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-200">
          {{ t('piniaDemo.title') }}
        </h1>
        <p class="text-base text-gray-500 dark:text-gray-400 mb-6">
          {{ t('piniaDemo.description') }}
        </p>

        <!-- User Store Demo -->
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('piniaDemo.userStore.title') }}</span>
          <el-tag :type="userStore.isLoggedIn ? 'success' : 'info'">
            {{ userStore.isLoggedIn ? t('piniaDemo.userStore.loggedIn') : t('piniaDemo.userStore.notLoggedIn') }}
          </el-tag>
        </div>
      </template>

      <div v-if="!userStore.isLoggedIn" class="login-form">
        <el-form :model="loginForm" label-width="80px">
          <el-form-item :label="t('piniaDemo.userStore.username')">
            <el-input v-model="loginForm.username" placeholder="admin" />
          </el-form-item>
          <el-form-item :label="t('piniaDemo.userStore.password')">
            <el-input v-model="loginForm.password" type="password" placeholder="123456" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin">
              {{ t('piniaDemo.userStore.login') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div v-else class="user-info">
        <el-descriptions class="user-info__descriptions" :column="1" border>
          <el-descriptions-item :label="t('piniaDemo.userStore.userId')">
            {{ userStore.userId }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('piniaDemo.userStore.username')">
            {{ userStore.username }}
          </el-descriptions-item>
          <el-descriptions-item :label="t('piniaDemo.userStore.roles')" v-permission="['admin:write']">
            <el-tag v-for="role in userStore.roles" :key="role" size="small">
              {{ role }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="t('piniaDemo.userStore.permissions')">
            <el-tag v-for="perm in userStore.permissions" :key="perm" size="small" type="success">
              {{ perm }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="action-buttons">
          <el-button type="danger" @click="handleLogout">
            {{ t('piniaDemo.userStore.logout') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- App Store Demo -->
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('piniaDemo.appStore.title') }}</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-form-item :label="t('piniaDemo.appStore.locale')">
          <el-radio-group v-model="appStore.locale" @change="handleLocaleChange">
            <el-radio value="zh-CN">中文</el-radio>
            <el-radio value="en">English</el-radio>
          </el-radio-group>
          <el-button type="primary" link @click="appStore.toggleLocale()">
            {{ t('piniaDemo.appStore.toggleLocale') }}
          </el-button>
        </el-form-item>

        <el-form-item :label="t('piniaDemo.appStore.theme')">
          <el-radio-group
            :model-value="appStore.theme"
            @update:model-value="handleThemeChange"
          >
            <el-radio value="light">{{ t('piniaDemo.appStore.light') }}</el-radio>
            <el-radio value="dark">{{ t('piniaDemo.appStore.dark') }}</el-radio>
            <el-radio value="auto">{{ t('piniaDemo.appStore.auto') }}</el-radio>
            <el-radio value="brandLight">{{ t('layout.header.themeBrandLight') }}</el-radio>
            <el-radio value="brandDark">{{ t('layout.header.themeBrandDark') }}</el-radio>
            <el-radio value="chinaRedLight">{{ t('layout.header.themeChinaRedLight') }}</el-radio>
            <el-radio value="chinaRedDark">{{ t('layout.header.themeChinaRedDark') }}</el-radio>
            <el-radio value="japaneseLight">{{ t('layout.header.themeJapaneseLight') }}</el-radio>
            <el-radio value="japaneseDark">{{ t('layout.header.themeJapaneseDark') }}</el-radio>
            <el-radio value="middleEastLight">{{ t('layout.header.themeMiddleEastLight') }}</el-radio>
            <el-radio value="middleEastDark">{{ t('layout.header.themeMiddleEastDark') }}</el-radio>
            <el-radio value="southeastAsiaLight">{{ t('layout.header.themeSoutheastAsiaLight') }}</el-radio>
            <el-radio value="southeastAsiaDark">{{ t('layout.header.themeSoutheastAsiaDark') }}</el-radio>
          </el-radio-group>
          <el-button type="primary" link @click="appStore.toggleTheme()">
            {{ t('piniaDemo.appStore.toggleTheme') }}
          </el-button>
        </el-form-item>

        <el-form-item :label="t('piniaDemo.appStore.device')">
          <el-tag :type="deviceTagType">{{ appStore.device }}</el-tag>
          <span class="ml-2">
            {{ t('piniaDemo.appStore.isMobile') }}: {{ appStore.isMobile ? t('common.yes') : t('common.no') }}
          </span>
        </el-form-item>

        <el-form-item :label="t('piniaDemo.appStore.sidebar')">
          <el-switch
            :model-value="appStore.sidebarOpened"
            @update:model-value="appStore.setSidebarOpened"
          />
          <span class="ml-2">
            {{ appStore.sidebarOpened ? t('piniaDemo.appStore.opened') : t('piniaDemo.appStore.closed') }}
          </span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Feature Flags Demo -->
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('piniaDemo.featureFlags.title') }}</span>
          <el-button type="primary" size="small" @click="handleRefreshFeatureFlags">
            {{ t('piniaDemo.featureFlags.refresh') }}
          </el-button>
        </div>
      </template>

      <div class="w-full overflow-x-auto">
      <el-table :data="featureFlagsStore.allFlags" border>
        <el-table-column prop="key" :label="t('piniaDemo.featureFlags.key')" width="200" />
        <el-table-column prop="enabled" :label="t('piniaDemo.featureFlags.enabled')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? t('common.yes') : t('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="value" :label="t('piniaDemo.featureFlags.value')">
          <template #default="{ row }">
            <code>{{ JSON.stringify(row.value) }}</code>
          </template>
        </el-table-column>
        <el-table-column prop="source" :label="t('piniaDemo.featureFlags.source')" width="120">
          <template #default="{ row }">
            <el-tag size="small">{{ row.source }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <div v-if="isDev" class="feature-override">
        <el-divider>{{ t('piniaDemo.featureFlags.devOverride') }}</el-divider>
        <el-form inline>
          <el-form-item :label="t('piniaDemo.featureFlags.key')">
            <el-input v-model="featureFlagForm.key" placeholder="newFeature" />
          </el-form-item>
          <el-form-item :label="t('piniaDemo.featureFlags.value')">
            <el-switch v-model="featureFlagForm.value" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSetFeatureOverride">
              {{ t('piniaDemo.featureFlags.setOverride') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- Cache Store Demo -->
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('piniaDemo.cache.title') }}</span>
          <div>
            <el-button type="warning" size="small" @click="handleCleanExpiredCache">
              {{ t('piniaDemo.cache.cleanExpired') }}
            </el-button>
            <el-button type="danger" size="small" @click="handleClearAllCache">
              {{ t('piniaDemo.cache.clearAll') }}
            </el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="4" border class="mb-4">
        <el-descriptions-item :label="t('piniaDemo.cache.total')">
          {{ cacheStats.total }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('piniaDemo.cache.memory')">
          {{ cacheStats.memory }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('piniaDemo.cache.persistent')">
          {{ cacheStats.persistent }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('piniaDemo.cache.expired')">
          {{ cacheStats.expired }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form inline>
        <el-form-item :label="t('piniaDemo.cache.key')">
          <el-input v-model="cacheForm.key" placeholder="myData" />
        </el-form-item>
        <el-form-item :label="t('piniaDemo.cache.value')">
          <el-input v-model="cacheForm.value" placeholder="Hello World" />
        </el-form-item>
        <el-form-item :label="t('piniaDemo.cache.ttl')">
          <el-input-number v-model="cacheForm.ttl" :min="0" :step="1000" />
        </el-form-item>
        <el-form-item :label="t('piniaDemo.cache.persist')">
          <el-switch v-model="cacheForm.persist" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSetCache">
            {{ t('piniaDemo.cache.set') }}
          </el-button>
          <el-button @click="handleGetCache">
            {{ t('piniaDemo.cache.get') }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-alert v-if="cacheResult" :type="cacheResult.type" :title="cacheResult.message" closable />
    </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'demo-pinia' });
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/modules/user';
import { useAppStore } from '@/store/modules/app';
import { useFeatureFlagsStore } from '@/store/modules/featureFlags';
import { useCacheStore } from '@/store/modules/cache';
import { setDayjsLocale } from '@/utils/dayjs';

const isDev = import.meta.env.DEV;
const { t, locale } = useI18n();
const userStore = useUserStore();
const appStore = useAppStore();
const featureFlagsStore = useFeatureFlagsStore();
const cacheStore = useCacheStore();

// User Store
const loginForm = reactive({
  username: 'admin',
  password: '123456',
});

async function handleLogin() {
  try {
    await userStore.login(loginForm);
    ElNotification.success({ message: t('piniaDemo.userStore.loginSuccess') });
  } catch (error) {
    ElNotification.error({ message: t('piniaDemo.userStore.loginFailed') });
  }
}

async function handleLogout() {
  try {
    await userStore.logout();
    ElNotification.success({ message: t('piniaDemo.userStore.logoutSuccess') });
  } catch (error) {
    ElNotification.error({ message: t('piniaDemo.userStore.logoutFailed') });
  }
}

// App Store
const deviceTagType = computed(() => {
  if (appStore.isMobile) return 'danger';
  if (appStore.isTablet) return 'warning';
  return 'success';
});

function handleLocaleChange(lang: string) {
  locale.value = lang;
  setDayjsLocale(lang);
  ElNotification.success({ message: t('piniaDemo.appStore.localeChanged') });
}

function handleThemeChange(v: Parameters<typeof appStore.setTheme>[0]) {
  appStore.setTheme(v);
}

// Feature Flags
const featureFlagForm = reactive({
  key: 'newFeature',
  value: true,
});

async function handleRefreshFeatureFlags() {
  try {
    await featureFlagsStore.refresh();
    ElNotification.success({ message: t('piniaDemo.featureFlags.refreshSuccess') });
  } catch (error) {
    ElNotification.error({ message: t('piniaDemo.featureFlags.refreshFailed') });
  }
}

function handleSetFeatureOverride() {
  if (!featureFlagForm.key) {
    ElNotification.warning({ message: t('piniaDemo.featureFlags.keyRequired') });
    return;
  }
  featureFlagsStore.setOverride(featureFlagForm.key, featureFlagForm.value);
  ElNotification.success({ message: t('piniaDemo.featureFlags.overrideSuccess') });
}

// Cache Store
const cacheForm = reactive({
  key: 'testData',
  value: 'Hello World',
  ttl: 60000, // 60s
  persist: false,
});

const cacheResult = ref<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
const cacheStats = computed(() => cacheStore.getStats());

function handleSetCache() {
  if (!cacheForm.key) {
    ElNotification.warning({ message: t('piniaDemo.cache.keyRequired') });
    return;
  }

  cacheStore.set(cacheForm.key, cacheForm.value, {
    ttl: cacheForm.ttl > 0 ? cacheForm.ttl : undefined,
    persist: cacheForm.persist,
  });

  cacheResult.value = {
    type: 'success',
    message: t('piniaDemo.cache.setSuccess', { key: cacheForm.key }),
  };
  ElNotification.success({ message: t('piniaDemo.cache.setSuccess', { key: cacheForm.key }) });
}

function handleGetCache() {
  if (!cacheForm.key) {
    ElNotification.warning({ message: t('piniaDemo.cache.keyRequired') });
    return;
  }

  const value = cacheStore.get(cacheForm.key);
  
  if (value !== null) {
    cacheResult.value = {
      type: 'success',
      message: `${t('piniaDemo.cache.getSuccess')}: ${JSON.stringify(value)}`,
    };
  } else {
    cacheResult.value = {
      type: 'info',
      message: t('piniaDemo.cache.notFound'),
    };
  }
}

function handleCleanExpiredCache() {
  cacheStore.cleanExpired();
  ElNotification.success({ message: t('piniaDemo.cache.cleanExpiredSuccess') });
}

function handleClearAllCache() {
  cacheStore.clear();
  cacheResult.value = null;
  ElNotification.success({ message: t('piniaDemo.cache.clearAllSuccess') });
}
</script>

<style scoped lang="scss">
/* 页面不设 min-width / max-width，宽度统一 100%，符合开发规范 */
.demo-card {
  margin-bottom: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  /* 用户状态管理栏：表格左侧标签 1/4，右侧内容 3/4 */
  .user-info__descriptions :deep(.el-descriptions__table) {
    table-layout: fixed;
    width: 100%;
  }
  .user-info__descriptions :deep(.el-descriptions__label) {
    width: 25%;
  }
  .user-info__descriptions :deep(.el-descriptions__content) {
    width: 75%;
  }

  .user-info .action-buttons {
    margin-top: 20px;
    display: flex;
    gap: 12px;
  }

  .feature-override {
    margin-top: 20px;
  }
}
</style>
