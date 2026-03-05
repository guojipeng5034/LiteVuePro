/**
 * 服务端时间工具
 * - 用服务端时间矫正本地时钟漂移
 * - 本地时间 = serverTime + (Date.now - 拉取时本地时间)
 * - 定期重新拉取矫正
 *
 * 使用方式
 * - 调用 await serverTimeUtil.init() 或 init({ correctionIntervalMs })
 * - 调用 serverTimeUtil.getNow() 或 serverTimeUtil.getTimeMs()
 * - 调用 init({ fetchServerTime }) 可自定义拉取函数，需返回 getHealth 的 timestamp
 */

/** 默认矫正间隔 1 小时 */
const DEFAULT_CORRECTION_INTERVAL_MS = 60 * 60 * 1000;

/** 拉取服务端时间，返回毫秒时间戳或 null */
export type FetchServerTime = () => Promise<number | null>;

/** 初始化选项接口 */
export interface ServerTimeInitOptions {
  /** 自定义拉取函数，需返回 getHealth 的 timestamp */
  fetchServerTime?: FetchServerTime;
  /** 矫正间隔（毫秒），默认 1 小时 */
  correctionIntervalMs?: number;
}

/** 服务端时间（拉取时） */
let serverTimeMs: number | null = null;
/** 本地时间（拉取时） */
let localTimeAtFetchMs: number = 0;
/** 矫正定时器 */
let correctionTimer: ReturnType<typeof setInterval> | null = null;
/** 当前拉取函数（由 init 设置） */
let currentFetch: FetchServerTime = defaultFetchServerTime;
let currentIntervalMs: number = DEFAULT_CORRECTION_INTERVAL_MS;

/**
 * 解析时间戳为毫秒
 * 小于 1e12 视为秒，否则视为毫秒
 */
function parseServerTimeMs(timestamp: number): number {
  return timestamp < 1e12 ? timestamp * 1000 : timestamp;
}

/** 默认从 getHealth 获取 timestamp */
async function defaultFetchServerTime(): Promise<number | null> {
  const { getHealth } = await import('@/api/demo');
  const res = await getHealth();
  const ts = res?.timestamp;
  if (typeof ts !== 'number') return null;
  return parseServerTimeMs(ts);
}

/**
 * 拉取并更新服务端时间
 */
async function fetchAndUpdate(): Promise<void> {
  try {
    const ms = await currentFetch();
    if (typeof ms !== 'number' || !Number.isFinite(ms)) return;
    const now = Date.now();
    serverTimeMs = ms;
    localTimeAtFetchMs = now;
    scheduleNextCorrection();
  } catch (e) {
    if (import.meta.env.DEV && typeof console !== 'undefined') {
      console.warn('[serverTime] fetch failed, using local time', e);
    }
  }
}

/**
 * 调度下一次矫正
 */
function scheduleNextCorrection(): void {
  if (correctionTimer) clearInterval(correctionTimer);
  correctionTimer = setInterval(() => {
    void fetchAndUpdate();
  }, currentIntervalMs);
}

/**
 * 初始化服务端时间
 * 在 main.ts 中调用
 * @param options 初始化选项
 */
export async function init(options?: ServerTimeInitOptions): Promise<void> {
  if (options?.fetchServerTime) currentFetch = options.fetchServerTime;
  if (options?.correctionIntervalMs != null && options.correctionIntervalMs > 0) {
    currentIntervalMs = options.correctionIntervalMs;
  }
  await fetchAndUpdate();
}

/**
 * 获取矫正后的当前 Date
 * 若未 init 则返回本地时间
 */
export function getNow(): Date {
  if (serverTimeMs == null) return new Date();
  const ms = serverTimeMs + (Date.now() - localTimeAtFetchMs);
  return new Date(ms);
}

/**
 * 获取矫正后的当前毫秒时间戳
 */
export function getTimeMs(): number {
  if (serverTimeMs == null) return Date.now();
  return serverTimeMs + (Date.now() - localTimeAtFetchMs);
}

/**
 * 是否已初始化完成
 */
export function isReady(): boolean {
  return serverTimeMs != null;
}

/**
 * 主动触发一次矫正
 */
export function correctNow(): Promise<void> {
  return fetchAndUpdate();
}

const serverTimeUtil = {
  init,
  getNow,
  getTimeMs,
  isReady,
  correctNow,
};

export default serverTimeUtil;
