<template>
  <aside
    class="app-sidebar h-full shrink-0 flex flex-col transition-all duration-200 app-sidebar--bordered"
    :class="[appStore.sidebarCollapsed ? 'w-64px' : 'w-220px']"
  >
    <!-- 背景由 style.css 与 app-header 统一按主题控制；此处仅叠一层透明动画 -->
    <div class="app-sidebar__bg absolute inset-0 z-0 overflow-hidden">
      <video
        class="app-sidebar__bg-video"
        :src="sidebarBackgroundSrc"
        autoplay
        loop
        muted
        playsinline
        tabindex="-1"
      />
    </div>
    <div class="app-sidebar__logo relative z-1 h-56px shrink-0 flex items-center justify-center app-sidebar__logo--bordered">
      <video
        v-if="!appStore.sidebarCollapsed"
        class="app-sidebar__logo-video"
        :src="logoVideoSrc"
        autoplay
        loop
        muted
        playsinline
        aria-label="LiteVuePro"
      />
      <video
        v-else
        class="app-sidebar__logo-video app-sidebar__logo-video--collapsed"
        :src="logoVideoSrc"
        autoplay
        loop
        muted
        playsinline
        aria-label="LiteVuePro"
      />
    </div>
    <el-scrollbar class="app-sidebar__menu relative z-1 flex-1 min-h-0">
      <el-menu
        :key="menuKey"
        :default-active="activeMenu"
        :default-openeds="defaultOpeneds"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        :unique-opened="false"
        class="app-sidebar__el-menu border-none!"
        background-color="transparent"
        text-color="var(--el-menu-text-color)"
        active-text-color="var(--el-color-primary)"
        @select="handleSelect"
      >
        <template v-for="item in menuTree" :key="item.path">
          <AppSidebarItem :item="item" :base-path="item.path" />
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/store/modules/user';
import { useAppStore } from '@/store/modules/app';
import { buildMenuTree, type MenuItem } from '@/utils/menuUtils';
// layout 子组件引用
import AppSidebarItem from '@/layout/AppSidebarItem/index.vue';
import logoLightSrc from '@/assets/images/LiteVueProLogo-light.webm';
import logoDarkSrc from '@/assets/images/LiteVueProLogo-dark.webm';
import sidebarBackgroundSrc from '@/assets/images/SidebarBackground.webm';

useI18n();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

/** 深色模式用 dark 版 logo，浅色用默认 */
const logoVideoSrc = computed(() =>
  appStore.isDarkTheme ? logoDarkSrc : logoLightSrc,
);

const layoutRoute = computed(() => {
  const routes = router.getRoutes();
  return routes.find(r => r.path === '/' && r.children?.length);
});

const menuTree = computed<MenuItem[]>(() => {
  const layout = layoutRoute.value;
  if (!layout?.children?.length) return [];
  return buildMenuTree(layout.children as import('vue-router').RouteRecordNormalized[], userStore);
});

/** 当前高亮：优先取 meta.activeMenu（如详情页高亮列表），否则取 path */
const activeMenu = computed(() => (route.meta?.activeMenu as string) ?? route.path);

/** 根据当前路由计算应展开的子菜单 path 列表 */
const defaultOpeneds = computed(() => {
  const path = route.path;
  const opened: string[] = [];
  const segments = path.split('/').filter(Boolean);
  let acc = '';
  for (const seg of segments) {
    acc = acc ? `${acc}/${seg}` : `/${seg}`;
    if (acc !== path) opened.push(acc);
  }
  return opened;
});

/** 仅在 default-openeds 变化时 remount，使展开状态生效（Element Plus 仅初始读取 default-openeds）。
 * 避免每次 path 变化都 remount，否则会触发 ElSubMenu 内部的 slot 警告 */
const menuKey = computed(() => defaultOpeneds.value.join(',') || 'root');

/** 根据 path 查找 MenuItem，判断是否为 expandOnly（仅展开不导航） */
function findMenuItem(path: string, items: MenuItem[] = menuTree.value): MenuItem | undefined {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.children?.length) {
      const found = findMenuItem(path, item.children);
      if (found) return found;
    }
  }
  return undefined;
}

function handleSelect(path: string) {
  if (!path || path === route.path) return;
  const item = findMenuItem(path);
  if (item?.expandOnly) return; // meta.menuExpandOnly：仅展开子菜单，不导航
  router.push(path).catch(() => {
    // 忽略重复导航等失败，避免未处理的 Promise 触发 Vue 的全局 error
  });
  // 移动端选中菜单后关闭侧栏
  if (appStore.isMobile) {
    appStore.setSidebarOpened(false);
  }
}
</script>

<style lang="scss" scoped>
.app-sidebar {
  --el-menu-bg-color: transparent;
  position: relative;
}
.app-sidebar__bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* 与 logo 一致：透明 WebM 直接透出下方背景，无需遮罩 */
}
.app-sidebar--bordered {
  border-right: 1px solid var(--el-border-color-lighter);
  box-shadow: 4px 0 16px -4px rgba(0, 0, 0, 0.04);
}
:global(.dark) .app-sidebar--bordered {
  border-right-color: var(--el-border-color);
  box-shadow: 4px 0 16px -4px rgba(0, 0, 0, 0.2);
}
.app-sidebar__logo--bordered {
  border-bottom: 1px solid var(--el-border-color-lighter);
  .dark & {
    border-bottom-color: var(--el-border-color);
  }
}
.app-sidebar__logo-video {
  display: block;
  width: auto;
  max-width: 100%;
  object-fit: contain;
  object-position: center;
}
.app-sidebar__logo-video--collapsed {
  height: 32px;
  max-width: 48px;
}
.app-sidebar__el-menu {
  padding: 8px 0;
}
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  margin: 2px 8px;
  border-radius: 6px;
}
:deep(.el-menu--collapse) .el-menu-item,
:deep(.el-menu--collapse) .el-sub-menu__title {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2px 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}
:deep(.el-menu--collapse) .el-menu-item > *:first-child,
:deep(.el-menu--collapse) .el-sub-menu__title > *:first-child {
  margin-right: 0 !important;
}
/* 收起时隐藏标题，仅保留图标，flex 才能把图标居中 */
:deep(.el-menu--collapse) .app-sidebar-item__title {
  display: none !important;
}
/* 收起时菜单项被包在 Tooltip 里，需居中 trigger 容器 */
:deep(.el-menu--collapse) .el-menu__tooltip-trigger {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
:deep(.el-menu--collapse) .el-menu__tooltip-trigger > *:first-child {
  margin-right: 0 !important;
}
:deep(.el-menu--collapse.el-menu) {
  padding-left: 0;
  padding-right: 0;
}
:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
}

/* 浅色模式下侧栏菜单文字颜色，与首页等保持一致（深色文字可读） */
:global(html:not(.dark)) .app-sidebar {
  --el-menu-text-color: #475569;
  --el-menu-hover-text-color: #0f172a;
  --el-menu-hover-bg-color: rgb(0 0 0 / 0.04);
  :deep(.el-menu-item:not(.is-active)),
  :deep(.el-sub-menu__title) {
    color: #475569;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :deep(.el-menu-item:not(.is-active):hover),
  :deep(.el-sub-menu:hover .el-sub-menu__title) {
    color: #0f172a;
    background-color: var(--el-menu-hover-bg-color);
  }
  :deep(.el-menu-item.is-active) {
    font-weight: 500;
    background-color: var(--el-color-primary-light-9);
  }
}

:global(.dark) .app-sidebar {
  --el-menu-text-color: rgb(156 163 175);
  --el-menu-hover-text-color: rgb(243 244 246);
  --el-menu-hover-bg-color: rgb(255 255 255 / 0.08);
  :deep(.el-menu-item:not(.is-active)),
  :deep(.el-sub-menu__title) {
    color: rgb(156 163 175);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :deep(.el-menu-item:not(.is-active):hover),
  :deep(.el-sub-menu:hover .el-sub-menu__title) {
    color: rgb(243 244 246);
    background-color: var(--el-menu-hover-bg-color);
  }
  :deep(.el-menu-item.is-active) {
    font-weight: 500;
    background-color: rgba(var(--el-color-primary-rgb), 0.15);
  }
}
</style>
