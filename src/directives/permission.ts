/**
 * 权限指令 v-permission
 * - 单权限：v-permission="'admin:write'"
 * - 多权限（满足其一即显示）：v-permission="['admin:write', 'user:read']"
 * 不满足时隐藏元素（display: none）
 */
import type { Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/store/modules/user';

function checkPermission(value: string | string[], userStore: ReturnType<typeof useUserStore>): boolean {
  if (typeof value === 'string') {
    return userStore.hasPermission(value);
  }
  if (Array.isArray(value) && value.length > 0) {
    return userStore.hasAnyPermission(value);
  }
  return false;
}

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding;
    const userStore = useUserStore();
    const hasPermission = checkPermission(value, userStore);
    if (!hasPermission) {
      el.style.display = 'none';
    }
  },
  updated(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding;
    const userStore = useUserStore();
    const hasPermission = checkPermission(value, userStore);
    if (hasPermission) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  },
};

export default permission;
