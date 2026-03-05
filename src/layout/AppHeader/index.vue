<template>
  <header class="app-header h-56px shrink-0 flex items-center justify-between px-4 bg-white dark:bg-gray-900 app-header--bordered">
    <div class="app-header__left flex items-center gap-3 min-w-0">
      <el-tooltip
        :content="tooltipContent"
        placement="bottom"
      >
        <el-button
          text
          circle
          class="shrink-0 text-gray-600 dark:text-gray-300"
          @click="handleMenuClick"
        >
          <Icon :icon="menuIcon" class="text-lg text-inherit" />
        </el-button>
      </el-tooltip>
      <el-breadcrumb separator="/" class="app-header__breadcrumb hidden sm:flex items-center">
        <el-breadcrumb-item v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
          <router-link
            v-if="i < breadcrumbs.length - 1"
            :to="crumb.path"
            class="text-gray-500 hover:text-primary transition-colors duration-200 dark:text-gray-400 font-normal"
          >
            {{ crumb.title }}
          </router-link>
          <span v-else class="text-gray-900 dark:text-gray-50 font-semibold tracking-wide">{{ crumb.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="app-header__right flex items-center gap-2 shrink-0">
      <el-tooltip :content="i18n.t('layout.header.toggleLang')" placement="bottom">
        <el-button text circle class="text-gray-600 dark:text-gray-300" @click="appStore.toggleLocale()">
          <Icon icon="mdi:translate" class="text-lg text-inherit" />
        </el-button>
      </el-tooltip>
      <el-dropdown trigger="click" class="app-header__theme" @command="handleThemeCommand">
        <span class="inline-flex cursor-pointer" style="outline: none;">
          <el-tooltip :content="i18n.t('layout.header.toggleTheme')" placement="bottom">
            <el-button text circle class="text-gray-600 dark:text-gray-300">
              <Icon :icon="themeIcon" class="text-lg text-inherit" />
            </el-button>
          </el-tooltip>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="light" :class="{ 'is-active': appStore.theme === 'light' }">
              <Icon icon="mdi:weather-sunny" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeLight') }}
            </el-dropdown-item>
            <el-dropdown-item command="dark" :class="{ 'is-active': appStore.theme === 'dark' }">
              <Icon icon="mdi:weather-night" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeDark') }}
            </el-dropdown-item>
            <el-dropdown-item command="auto" :class="{ 'is-active': appStore.theme === 'auto' }">
              <Icon icon="mdi:theme-outline" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeAuto') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="brandLight" :class="{ 'is-active': appStore.theme === 'brandLight' }">
              <Icon icon="mdi:palette-outline" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeBrandLight') }}
            </el-dropdown-item>
            <el-dropdown-item command="brandDark" :class="{ 'is-active': appStore.theme === 'brandDark' }">
              <Icon icon="mdi:palette-outline" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeBrandDark') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="chinaRedLight" :class="{ 'is-active': appStore.theme === 'chinaRedLight' }">
              <Icon icon="mdi:flag" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeChinaRedLight') }}
            </el-dropdown-item>
            <el-dropdown-item command="chinaRedDark" :class="{ 'is-active': appStore.theme === 'chinaRedDark' }">
              <Icon icon="mdi:flag" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeChinaRedDark') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="japaneseLight" :class="{ 'is-active': appStore.theme === 'japaneseLight' }">
              <Icon icon="mdi:white-balance-sunny" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeJapaneseLight') }}
            </el-dropdown-item>
            <el-dropdown-item command="japaneseDark" :class="{ 'is-active': appStore.theme === 'japaneseDark' }">
              <Icon icon="mdi:white-balance-sunny" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeJapaneseDark') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="middleEastLight" :class="{ 'is-active': appStore.theme === 'middleEastLight' }">
              <Icon icon="mdi:palette" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeMiddleEastLight') }}
            </el-dropdown-item>
            <el-dropdown-item command="middleEastDark" :class="{ 'is-active': appStore.theme === 'middleEastDark' }">
              <Icon icon="mdi:palette" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeMiddleEastDark') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="southeastAsiaLight" :class="{ 'is-active': appStore.theme === 'southeastAsiaLight' }">
              <Icon icon="mdi:leaf" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeSoutheastAsiaLight') }}
            </el-dropdown-item>
            <el-dropdown-item command="southeastAsiaDark" :class="{ 'is-active': appStore.theme === 'southeastAsiaDark' }">
              <Icon icon="mdi:leaf" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.themeSoutheastAsiaDark') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-dropdown trigger="click" class="app-header__user" @command="handleUserCommand">
        <span class="flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
          <el-avatar v-if="userStore.avatar" :size="32" class="shrink-0 ring-2 ring-transparent hover:ring-primary/20 transition-shadow" :src="userStore.avatar" />
          <span v-else class="app-header__avatar-placeholder shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 ring-2 ring-transparent hover:ring-primary/20 transition-shadow">
            <video
              class="app-header__avatar-video"
              :src="defaultAvatarVideoSrc"
              autoplay
              loop
              muted
              playsinline
              tabindex="-1"
            />
          </span>
          <span class="hidden md:inline text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-32">{{ userStore.nickname }}</span>
          <Icon icon="mdi:chevron-down" class="text-sm shrink-0 text-gray-500" />
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled class="text-gray-500">
              {{ userStore.username }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <Icon icon="mdi:logout" class="mr-2 align-middle text-inherit" />
              {{ i18n.t('layout.header.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/modules/user';
import { useAppStore } from '@/store/modules/app';
import defaultAvatarSrc from '@/assets/images/default-avatar.webm';
import defaultAvatarDarkSrc from '@/assets/images/default-avatar-dark.webm';

const i18n = useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

/** 侧栏关闭时点击=打开；打开时：移动端=关闭，桌面端=切换折叠 */
function handleMenuClick() {
  if (!appStore.sidebarOpened) {
    appStore.setSidebarOpened(true);
    return;
  }
  if (appStore.isMobile) {
    appStore.setSidebarOpened(false);
  } else {
    appStore.toggleSidebarCollapsed();
  }
}

const tooltipContent = computed(() => {
  if (!appStore.sidebarOpened) return i18n.t('layout.header.expandMenu');
  if (appStore.isMobile) return i18n.t('layout.header.collapseMenu');
  return appStore.sidebarCollapsed ? i18n.t('layout.header.expandMenu') : i18n.t('layout.header.collapseMenu');
});

const menuIcon = computed(() => {
  if (!appStore.sidebarOpened) return 'mdi:menu';
  if (appStore.isMobile) return 'mdi:backburger';
  return appStore.sidebarCollapsed ? 'mdi:menu' : 'mdi:backburger';
});

/** 无用户头像时使用的默认头像视频，深色模式用 dark 版 */
const defaultAvatarVideoSrc = computed(() =>
  appStore.isDarkTheme ? defaultAvatarDarkSrc : defaultAvatarSrc,
);

function breadcrumbTitle(title: string): string {
  if (!title) return '';
  return title.includes('.') ? i18n.t(title) : title;
}

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(r => r.meta?.title);
  return matched.map(r => ({
    path: r.path,
    title: breadcrumbTitle((r.meta?.title as string) ?? r.path),
  }));
});

const themeIcon = computed(() => {
  const t = appStore.theme;
  if (t === 'southeastAsiaLight' || t === 'southeastAsiaDark') return 'mdi:leaf';
  if (t === 'middleEastLight' || t === 'middleEastDark') return 'mdi:palette';
  if (t === 'japaneseLight' || t === 'japaneseDark') return 'mdi:white-balance-sunny';
  if (t === 'chinaRedLight' || t === 'chinaRedDark') return 'mdi:flag';
  if (t === 'brandLight' || t === 'brandDark') return 'mdi:palette-outline';
  if (appStore.isDarkTheme) return 'mdi:weather-sunny';
  return 'mdi:weather-night';
});

const themeOptions = [
  'light', 'dark', 'auto',
  'brandLight', 'brandDark', 'chinaRedLight', 'chinaRedDark',
  'japaneseLight', 'japaneseDark', 'middleEastLight', 'middleEastDark', 'southeastAsiaLight', 'southeastAsiaDark',
] as const;

function handleThemeCommand(command: string) {
  if (themeOptions.includes(command as typeof themeOptions[number])) {
    appStore.setTheme(command as typeof themeOptions[number]);
  }
}

async function handleUserCommand(command: string) {
  if (command === 'logout') {
    await userStore.logout();
    router.push('/login');
  }
}
</script>

<style lang="scss" scoped>
.app-header--bordered {
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.04);
  .dark & {
    border-bottom-color: var(--el-border-color);
    box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.2);
  }
}

/* 默认头像视频：与 el-avatar 同尺寸圆形 */
.app-header__avatar-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 去掉切换语言、主题、收起菜单等图标按钮及用户下拉点击后的焦点黑框 */
.app-header :deep(.el-button) {
  outline: none;
  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
}
.app-header__user :deep(.el-dropdown__trigger) {
  outline: none;
  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
}

/* 主题下拉当前项高亮 */
.app-header__theme :deep(.el-dropdown-menu__item.is-active) {
  color: var(--el-color-primary);
  font-weight: 500;
}
</style>
