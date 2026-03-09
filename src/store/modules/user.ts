// src/store/modules/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * 用户信息
 */
export interface UserInfo {
  id: string | number;
  username: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

/**
 * 用户 Store
 *
 * 职责:
 * - 登录/登出
 * - Token 持久化 (localStorage)
 * - 用户信息
 * - 角色/权限
 * - 权限检查
 * 
 * @example
 * ```ts
 * const userStore = useUserStore();
 * await userStore.login({ username, password });
 * if (userStore.hasPermission('admin:write')) {
 *   // do something
 * }
 * ```
 */
export const useUserStore = defineStore('user', () => {
  // ===== State =====
  const token = ref<string>('');
  const refreshToken = ref<string>('');
  const userInfo = ref<UserInfo | null>(null);
  const loginTime = ref<number>(0);

  // ===== Getters =====
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value);
  const userId = computed(() => userInfo.value?.id ?? '');
  const username = computed(() => userInfo.value?.username ?? '');
  const nickname = computed(() => userInfo.value?.nickname ?? userInfo.value?.username ?? '');
  const avatar = computed(() => userInfo.value?.avatar ?? '');
  const roles = computed(() => userInfo.value?.roles ?? []);
  const permissions = computed(() => userInfo.value?.permissions ?? []);

  // ===== Actions =====

  /**
   * 设置 Token
   */
  function setToken(newToken: string, newRefreshToken?: string) {
    token.value = newToken;
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;
    }
    loginTime.value = Date.now();
  }

  /**
   * 设置用户信息
   */
  function setUserInfo(info: UserInfo) {
    userInfo.value = info;
  }

  /**
   * 登录，调用 API 获取 Token 后设置 roles/permissions
   */
  async function login(credentials: { username: string; password: string }) {
    try {
      const { loginApi } = await import('@/api/auth');
      const data = await loginApi(credentials);
      setToken(data.token, data.refreshToken);
      setUserInfo(data.user);
      const { useDictStore } = await import('@/store/modules/dict');
      await useDictStore().initDict();
      return { success: true };
    } catch (error) {
      console.error('[useUserStore] login error:', error);
      throw error;
    }
  }

  /**
   * 登出，调用 API 后清空本地
   */
  async function logout() {
    try {
      const { logoutApi } = await import('@/api/auth');
      await logoutApi();
    } catch {
      // 登出 API 失败也继续清空本地
    } finally {
      token.value = '';
      refreshToken.value = '';
      userInfo.value = null;
      loginTime.value = 0;
    }
    return { success: true };
  }

  /**
   * 刷新 Token，失败时自动 logout
   */
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      await logout();
      throw new Error('No refresh token');
    }
    try {
      const { refreshTokenApi } = await import('@/api/auth');
      const data = await refreshTokenApi(refreshToken.value);
      setToken(data.token, data.refreshToken);
      if (data.user) setUserInfo(data.user);
      return { success: true };
    } catch (error) {
      console.error('[useUserStore] refreshAccessToken error:', error);
      await logout();
      throw error;
    }
  }

  /**
   * 拉取用户信息并更新 store
   */
  async function fetchUserInfo() {
    if (!token.value) {
      throw new Error('Not logged in');
    }
    const { getUserInfoApi } = await import('@/api/auth');
    const user = await getUserInfoApi();
    setUserInfo(user);
    return { success: true, data: user };
  }

  /**
   * 是否拥有某角色
   */
  function hasRole(role: string): boolean {
    return roles.value.includes(role);
  }

  /**
   * 是否拥有某权限
   */
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission);
  }

  /**
   * 是否拥有任一权限
   */
  function hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => permissions.value.includes(p));
  }

  /**
   * 是否拥有全部权限
   */
  function hasAllPermissions(perms: string[]): boolean {
    return perms.every(p => permissions.value.includes(p));
  }

  return {
    // state
    token,
    refreshToken,
    userInfo,
    loginTime,
    // getters
    isLoggedIn,
    userId,
    username,
    nickname,
    avatar,
    roles,
    permissions,
    // actions
    setToken,
    setUserInfo,
    login,
    logout,
    refreshAccessToken,
    fetchUserInfo,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
}, {
  // persist 配置 - key 为 localStorage key，需与 pinia-plugin-persistedstate 兼容
  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['token', 'refreshToken', 'userInfo', 'loginTime'],
  } as { key: string; storage: Storage; paths: string[] },
});
