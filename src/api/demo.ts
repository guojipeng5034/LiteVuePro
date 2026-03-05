/**
 * Demo 模块 API - 健康检查、用户信息、带参请求等
 * 使用项目共用的 alova 实例（baseURL 由环境/app.config 决定）
 */
import { alovaInstance } from '@/utils/http';

/** 健康检查响应 */
export interface HealthResponse {
  ok: boolean;
  timestamp: number;
}

/** 用户信息响应 */
export interface UserMeResponse {
  id: number;
  name: string;
  role: string;
}

/** 带参请求响应 */
export interface DemoParamsResponse {
  query: Record<string, string>;
  message: string;
}

/** 健康检查 GET /api/health */
export function getHealth() {
  return alovaInstance.Get<HealthResponse>('/api/health').send();
}

/** 用户信息 GET /api/user/me */
export function getUserMe() {
  return alovaInstance.Get<UserMeResponse>('/api/user/me').send();
}

/** 带参请求 GET /api/demo/params（qs 序列化） */
export function getDemoParams(params: {
  ids: number[];
  filter: { role: string; status: string };
}) {
  return alovaInstance
    .Get<DemoParamsResponse>('/api/demo/params', { params })
    .send();
}
