/**
 * API 层统一类型约定
 * - 请求/响应类型按模块在对应 api 文件中定义，或在此处定义通用结构
 * - 与 http 层业务码约定一致：code 0/200 为成功，拦截器返回 data 部分
 */

/** 统一业务响应：code 0/200 为成功，data 为业务数据（http 拦截器已解析为 data） */
export interface ApiResponse<T = unknown> {
  code: number;
  message?: string;
  data?: T;
}

/** 分页请求参数（与后端约定一致时可复用） */
export interface PageQuery {
  pageNo?: number;
  pageSize?: number;
}

/** 分页结果（列表接口返回的 data 结构） */
export interface PageResult<T = unknown> {
  list: T[];
  total: number;
}
