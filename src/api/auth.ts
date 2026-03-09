/**
 * 认证模块 API - 登录、获取用户信息、登出
 * 与 mocks/auth 对应，Mock 环境下由 MSW 拦截
 */
import { alovaInstance } from '@/utils/http';
import type { UserInfo } from '@/store/modules/user';

/** 登录请求参数 */
export interface LoginParams {
  username: string;
  password: string;
}

/** 登录响应：Token + 用户信息（后端可只返回 token，再通过 getUserInfo 拉取用户与权限） */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: UserInfo;
}

/** 统一业务响应：code 0/200 为成功，data 为业务数据 */
export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

/** 登录 POST /api/auth/login（dedupKey 防重复提交） */
export function loginApi(params: LoginParams) {
  return alovaInstance
    .Post<LoginResponse>('/api/auth/login', params, { config: { dedupKey: 'auth-login' } })
    .send();
}

/** 刷新 Token POST /api/auth/refresh */
export function refreshTokenApi(refreshToken: string) {
  return alovaInstance.Post<LoginResponse>('/api/auth/refresh', { refreshToken }).send();
}

/** 获取当前用户信息（含角色、权限）GET /api/auth/user */
export function getUserInfoApi() {
  return alovaInstance.Get<UserInfo>('/api/auth/user').send();
}

/** 当前用户菜单树 GET /api/auth/menus（与 api/system MenuVO 一致） */
export function getAuthMenusApi() {
  return alovaInstance.Get<AuthMenuVO[]>('/api/auth/menus').send();
}

export interface AuthMenuVO {
  id: number;
  name: string;
  path: string;
  icon?: string;
  sort: number;
  children?: AuthMenuVO[];
}

/** 登出 POST /api/auth/logout（dedupKey 防重复提交） */
export function logoutApi() {
  return alovaInstance
    .Post<void>('/api/auth/logout', undefined, { config: { dedupKey: 'auth-logout' } })
    .send();
}
