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

/** 登录 POST /api/auth/login（拦截器返回 data 部分，故泛型为 LoginResponse） */
export function loginApi(params: LoginParams) {
  return alovaInstance.Post<LoginResponse>('/api/auth/login', params).send();
}

/** 获取当前用户信息（含角色、权限）GET /api/auth/user */
export function getUserInfoApi() {
  return alovaInstance.Get<UserInfo>('/api/auth/user').send();
}

/** 登出 POST /api/auth/logout */
export function logoutApi() {
  return alovaInstance.Post<void>('/api/auth/logout').send();
}
