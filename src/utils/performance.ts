/**
 * 前端性能打点：路由切换耗时、可选首屏
 * 与 Matomo 集成，便于发现慢页/慢接口
 */
import { trackMatomoEvent } from '@/utils/analytics';

/** 仅生产或显式开启时上报 */
const ENABLE_PERF =
  import.meta.env.PROD || import.meta.env.VITE_PERF_TRACKING === 'true';

/**
 * 上报路由切换耗时（在 router.afterEach 中调用）
 * @param path 当前路由 path
 * @param durationMs 从导航开始到 afterEach 的毫秒数
 */
export function trackRouteTiming(path: string, durationMs: number): void {
  if (!ENABLE_PERF || durationMs < 0) return;
  trackMatomoEvent('perf', 'route', path, Math.round(durationMs));
}
