/**
 * MSW handlers 聚合 - 各模块 Mock 入口
 */
import type { HttpHandler } from 'msw';
import { demoHandlers } from './demo';
import { authHandlers } from './auth';
import { systemHandlers } from './system';

export const handlers: HttpHandler[] = [
  ...demoHandlers,
  ...authHandlers,
  ...systemHandlers,
];
