<template>
  <div class="tab-nav shrink-0 bg-white dark:bg-gray-900 tab-nav--bordered flex items-stretch">
    <el-tabs
      v-model="activePath"
      type="card"
      class="tab-nav__el-tabs flex-1 min-w-0"
      :closable="false"
      @tab-change="handleTabChange"
    >
      <!-- closable=false 避免 el-tab-pane 自带关闭图标，仅用 #label 内自定义 X -->
      <el-tab-pane
        v-for="tab in tabNavStore.visitedTabs"
        :key="tab.fullPath"
        :name="tab.fullPath"
        :closable="false"
      >
        <template #label>
          <el-dropdown
            trigger="contextmenu"
            :teleported="true"
            class="h-full"
            @command="(cmd: string) => handleContextMenuCommand(cmd, tab.fullPath)"
          >
            <span
              class="tab-nav__label"
              @mousedown.middle="!tab.affix && handleClose(tab.fullPath)"
            >
              <span class="tab-nav__title truncate">{{ tabTitle(tab.title) }}</span>
              <el-icon
                v-if="!tab.affix"
                class="tab-nav__close"
                @click.stop="handleClose(tab.fullPath)"
              >
                <Close />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="refresh">
                  <el-icon><Refresh /></el-icon>
                  {{ i18n.t('tabNav.refresh') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="!tab.affix"
                  command="close"
                  divided
                >
                  <el-icon><Close /></el-icon>
                  {{ i18n.t('tabNav.close') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="hasClosableOthers"
                  command="closeOthers"
                >
                  <el-icon><SemiSelect /></el-icon>
                  {{ i18n.t('tabNav.closeOthers') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="hasClosableLeft(tab.fullPath)"
                  command="closeLeft"
                >
                  <el-icon><Back /></el-icon>
                  {{ i18n.t('tabNav.closeLeft') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="hasClosableRight(tab.fullPath)"
                  command="closeRight"
                >
                  <el-icon><Right /></el-icon>
                  {{ i18n.t('tabNav.closeRight') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="hasClosableAll"
                  command="closeAll"
                >
                  <el-icon><CircleClose /></el-icon>
                  {{ i18n.t('tabNav.closeAll') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-tab-pane>
    </el-tabs>
    <!-- 右侧汉堡菜单：关闭当前 / 其他 / 全部（无可关闭项时隐藏） -->
    <el-dropdown
      v-if="canCloseCurrent || hasClosableOthers || hasClosableAll"
      trigger="click"
      placement="bottom-end"
      :teleported="true"
      @command="handleHamburgerCommand"
    >
      <button
        type="button"
        class="tab-nav__more-btn shrink-0"
        :title="i18n.t('tabNav.moreActions')"
      >
        <el-icon><Operation /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon>
            {{ i18n.t('tabNav.refresh') }}
          </el-dropdown-item>
          <el-dropdown-item
            v-if="canCloseCurrent"
            command="closeCurrent"
            divided
          >
            <el-icon><Close /></el-icon>
            {{ i18n.t('tabNav.closeCurrent') }}
          </el-dropdown-item>
          <el-dropdown-item
            v-if="hasClosableOthers"
            command="closeOthers"
          >
            <el-icon><SemiSelect /></el-icon>
            {{ i18n.t('tabNav.closeOthers') }}
          </el-dropdown-item>
          <el-dropdown-item
            v-if="hasClosableAll"
            command="closeAll"
          >
            <el-icon><CircleClose /></el-icon>
            {{ i18n.t('tabNav.closeAll') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
/**
 * 页面标签栏：基于 Element Plus el-tabs 封装
 * - 标签新增：同 path 不重复，仅切换；标题取自 meta.title，无则「未命名页面」
 * - 标签关闭：X 关闭；关闭后切到上一标签或首页；affix 不可关闭
 * - 路由联动：点击标签 router.push；store.cachedNames 控制的是「跳转后的页面」的 keep-alive
 * - 持久化：标签列表与激活路径存 localStorage，刷新恢复
 */
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Close, Operation, Refresh, Back, Right, SemiSelect, CircleClose } from '@element-plus/icons-vue';
import { useTabNavStore } from '@/store/modules/tabNav';

const props = withDefaults(
  defineProps<{
    /** 首页路径，关闭最后一个标签时跳转（默认 /） */
    defaultPath?: string;
    /** 是否参与标签的路由 path 列表，空则全部参与 */
    tabPaths?: string[];
  }>(),
  {
    defaultPath: '/',
    tabPaths: () => [],
  }
);

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const tabNavStore = useTabNavStore();

/** el-tabs 双向绑定：使用 path */
const activePath = ref(tabNavStore.activePath);

/** 是否应为当前路由添加标签（noTagsView、login/404/403/redirect 不参与；仅 layout 下子路由参与） */
function shouldAddTab(): boolean {
  if (route.meta?.noTagsView === true) return false;
  const path = route.path;
  if (path === '/login' || path === '/404' || path === '/403' || path.startsWith('/redirect')) return false;
  if (props.tabPaths.length > 0) return props.tabPaths.some(p => path === p || path.startsWith(p + '/'));
  return route.matched.length >= 2 && route.matched[0]?.path === '/';
}

/** 路由变化时：同 path 不重复添加，仅切换；路由无 title 显示「未命名页面」 */
watch(
  () => route.fullPath,
  () => {
    if (!shouldAddTab()) return;
    tabNavStore.addTab(route);
    // 等标签列表渲染后再同步 activePath，避免 el-tabs 在 watcher 中因找不到对应 pane 抛错
    nextTick(() => {
      activePath.value = tabNavStore.activePath;
    });
  }
);

watch(
  () => tabNavStore.activePath,
  (path) => {
    nextTick(() => {
      activePath.value = path;
    });
  }
);

/** 点击标签：触发路由跳转，同步页面内容 */
function handleTabChange(name: string | number) {
  const fullPath = String(name);
  if (fullPath === route.fullPath) return;
  router.push(fullPath).catch(() => {
    // 路由跳转失败时不新增标签（addTab 已在 watch 中，这里仅避免重复）
  });
}

/** 是否存在可关闭的「其他」标签（除当前外有非 affix） */
const hasClosableOthers = computed(() =>
  tabNavStore.visitedTabs.some(t => !t.affix && t.fullPath !== route.fullPath)
);

/** 是否存在可关闭的「全部」（有非 affix 标签） */
const hasClosableAll = computed(() => tabNavStore.visitedTabs.some(t => !t.affix));

/** 可关闭右侧 */
const hasClosableRight = (fullPath: string) => {
  const index = tabNavStore.visitedTabs.findIndex(t => t.fullPath === fullPath);
  return index !== -1 && tabNavStore.visitedTabs.slice(index + 1).some(t => !t.affix);
};

/** 可关闭左侧 */
const hasClosableLeft = (fullPath: string) => {
  const index = tabNavStore.visitedTabs.findIndex(t => t.fullPath === fullPath);
  return index !== -1 && tabNavStore.visitedTabs.slice(0, index).some(t => !t.affix);
};

/** 当前标签是否可关闭（非 affix） */
const canCloseCurrent = computed(() => {
  const cur = tabNavStore.visitedTabs.find(t => t.fullPath === route.fullPath);
  return cur != null && !cur.affix;
});

/** 关闭标签：禁止关闭 affix；关闭后切到上一或首页；对应缓存由 cachedNames 自动移除 */
function handleClose(fullPath: string) {
  const nextFullPath = tabNavStore.removeTab(fullPath, props.defaultPath);
  if (nextFullPath != null && route.fullPath === fullPath) {
    router.push(nextFullPath).catch(() => {});
  }
}

/** 右键菜单命令 */
function handleContextMenuCommand(command: string, fullPath: string) {
  if (command === 'refresh') {
    handleRefresh(fullPath);
    return;
  }
  if (command === 'close' && !tabNavStore.visitedTabs.find(t => t.fullPath === fullPath)?.affix) {
    handleClose(fullPath);
    return;
  }
  if (command === 'closeOthers') {
    tabNavStore.removeOtherTabs(fullPath, props.defaultPath);
    if (route.fullPath !== fullPath) router.push(fullPath).catch(() => {});
    return;
  }
  if (command === 'closeLeft') {
    tabNavStore.removeLeftTabs(fullPath);
    if (route.fullPath !== fullPath) router.push(fullPath).catch(() => {});
    return;
  }
  if (command === 'closeRight') {
    tabNavStore.removeRightTabs(fullPath);
    if (route.fullPath !== fullPath) router.push(fullPath).catch(() => {});
    return;
  }
  if (command === 'closeAll') {
    const nextFullPath = tabNavStore.removeAllTabs(props.defaultPath);
    if (nextFullPath != null) router.push(nextFullPath).catch(() => {});
  }
}

/** 刷新标签 */
function handleRefresh(fullPath: string) {
  const tab = tabNavStore.visitedTabs.find(t => t.fullPath === fullPath);
  if (tab?.name) {
    tabNavStore.delCachedView(tab.name);
    // 使用 redirect 页面实现局部刷新
    const redirectPath = `/redirect${fullPath}`;
    nextTick(() => {
      if (route.fullPath === fullPath) {
        router.replace(redirectPath).catch(() => {});
      } else {
        router.push(redirectPath).catch(() => {});
      }
    });
  }
}

/** 汉堡菜单命令 */
function handleHamburgerCommand(command: string) {
  if (command === 'refresh') {
    handleRefresh(route.fullPath);
    return;
  }
  if (command === 'closeCurrent') {
    handleClose(route.fullPath);
    return;
  }
  if (command === 'closeOthers') {
    tabNavStore.removeOtherTabs(route.fullPath, props.defaultPath);
    return;
  }
  if (command === 'closeAll') {
    const nextFullPath = tabNavStore.removeAllTabs(props.defaultPath);
    if (nextFullPath != null) router.push(nextFullPath).catch(() => {});
  }
}

/** 标题：支持 i18n key（含 . 则翻译） */
function tabTitle(title: string): string {
  if (!title) return i18n.t('tabNav.unnamed');
  return title.includes('.') ? i18n.t(title) : title;
}

onMounted(() => {
  tabNavStore.initFromStorage();
  tabNavStore.initAffixTabs(router.getRoutes());
  if (shouldAddTab()) tabNavStore.addTab(route);
  activePath.value = tabNavStore.activePath;
});
</script>

<style lang="scss" scoped>
.tab-nav {
  height: 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  .dark & {
    border-bottom-color: var(--el-border-color);
  }
}

.tab-nav__el-tabs {
  --el-tabs-header-height: 40px;
}

.tab-nav__label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 180px;
  height: 100%;
  padding: 0 4px;
}

.tab-nav__title {
  flex: 1;
  min-width: 0;
  @apply text-gray-800 dark:text-gray-200;
}

.tab-nav__close {
  font-size: 12px;
  width: 16px;
  height: 16px;
  line-height: 16px;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  @apply text-gray-400 dark:text-gray-500;
  &:hover {
    background-color: var(--el-color-danger);
    color: #fff !important;
  }
}

:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: none;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 8px;
}

:deep(.el-tabs__item) {
  padding: 0 16px !important;
  height: 40px;
  line-height: 40px;
  border: none !important;
  transition: all 0.3s;
  &.is-active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    position: relative;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--el-color-primary);
    }
  }
  .dark &.is-active {
    background: var(--el-color-primary-light-1);
    background: rgba(var(--el-color-primary-rgb), 0.15);
  }
}

:deep(.el-tabs__content) {
  display: none;
}

:deep(.el-tabs__nav-scroll) {
  overflow-x: auto;
  /* 隐藏滚动条，避免 tab 多时难看，仍支持鼠标滚轮/触摸滚动 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-nav__more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 4px 4px 4px 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  @apply text-gray-600 dark:text-gray-300;
  &:hover {
    background-color: var(--el-fill-color-dark);
    color: var(--el-text-color-primary);
  }
}
</style>
