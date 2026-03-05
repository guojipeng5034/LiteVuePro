<template>
  <!-- 有子菜单且子菜单不为空：渲染为 el-sub-menu，支持 3 级以上嵌套 -->
  <el-sub-menu v-if="item.children?.length" :index="item.path">
    <template #title>
      <Icon v-if="item.icon" :icon="item.icon" class="app-sidebar-item__icon shrink-0" />
      <span class="app-sidebar-item__title truncate">{{ menuTitle(item.title) }}</span>
    </template>
    <AppSidebarItem
      v-for="child in item.children"
      :key="child.path"
      :item="child"
      :base-path="child.path"
    />
  </el-sub-menu>
  <!-- 叶子节点：渲染为 el-menu-item -->
  <el-menu-item v-else :index="item.path">
    <Icon v-if="item.icon" :icon="item.icon" class="app-sidebar-item__icon shrink-0" />
    <span class="app-sidebar-item__title truncate">{{ menuTitle(item.title) }}</span>
  </el-menu-item>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { MenuItem } from '@/utils/menuUtils';

defineOptions({ name: 'AppSidebarItem' });

defineProps<{
  item: MenuItem;
  basePath: string;
}>();

const { t } = useI18n();
/** 支持 meta.title 为 i18n key（如 layout.menu.home）或纯文案 */
function menuTitle(title: string): string {
  if (!title) return '';
  return title.includes('.') ? t(title) : title;
}
</script>

<style lang="scss" scoped>
.app-sidebar-item__icon {
  font-size: 1.125rem;
  margin-right: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.app-sidebar-item__title {
  flex: 1;
  min-width: 0;
  transition: opacity 0.3s;
}

:deep(.el-menu-item:hover) .app-sidebar-item__icon,
:deep(.el-sub-menu__title:hover) .app-sidebar-item__icon {
  transform: scale(1.1);
}
</style>
