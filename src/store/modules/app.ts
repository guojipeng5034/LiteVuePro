// src/store/modules/app.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { getAppConfig } from '@/utils/appConfig';
import type { Locale } from 'vue-i18n';

/**
 * 应用全局状态管理 Store
 * 
 * 功能:
 * - 语言切换
 * - 主题管理
 * - 侧边栏/菜单状态
 * - 设备类型检测
 * - 全局 loading
 * - 应用配置
 * 
 * @example
 * ```ts
 * const appStore = useAppStore();
 * appStore.setLocale('en');
 * appStore.toggleSidebar();
 * ```
 */
export const useAppStore = defineStore('app', () => {
  const appConfig = getAppConfig();

  // ===== State =====
  const locale = ref<string>(appConfig.defaultLocale || 'zh-CN');
  /** 主题：浅色/深色/跟随系统 + 品牌/中国红/日式/中东/东南亚 各浅色深色 */
  const theme = ref<
    'light' | 'dark' | 'auto' |
    'brandLight' | 'brandDark' | 'chinaRedLight' | 'chinaRedDark' |
    'japaneseLight' | 'japaneseDark' | 'middleEastLight' | 'middleEastDark' | 'southeastAsiaLight' | 'southeastAsiaDark'
  >('auto');
  const sidebarOpened = ref<boolean>(true);
  const sidebarCollapsed = ref<boolean>(false);
  const device = ref<'desktop' | 'tablet' | 'mobile'>('desktop');
  const globalLoading = ref<boolean>(false);
  const pageLoading = ref<boolean>(false);

  // ===== Getters =====
  const isMobile = computed(() => device.value === 'mobile');
  const isTablet = computed(() => device.value === 'tablet');
  const isDesktop = computed(() => device.value === 'desktop');
  const isDarkTheme = computed(() => {
    if (theme.value === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme.value === 'dark' || theme.value === 'brandDark' || theme.value === 'chinaRedDark' ||
      theme.value === 'japaneseDark' || theme.value === 'middleEastDark' || theme.value === 'southeastAsiaDark';
  });
  const isBrandTheme = computed(() => theme.value === 'brandLight' || theme.value === 'brandDark');
  const isChinaRedTheme = computed(() => theme.value === 'chinaRedLight' || theme.value === 'chinaRedDark');
  const isJapaneseTheme = computed(() => theme.value === 'japaneseLight' || theme.value === 'japaneseDark');
  const isMiddleEastTheme = computed(() => theme.value === 'middleEastLight' || theme.value === 'middleEastDark');
  const isSoutheastAsiaTheme = computed(() => theme.value === 'southeastAsiaLight' || theme.value === 'southeastAsiaDark');

  // ===== Actions =====

  /**
   * 设置语言
   */
  function setLocale(lang: string) {
    const supportedLocales = appConfig.supportedLocales || ['zh-CN', 'en'];
    if (!supportedLocales.includes(lang)) {
      console.warn(`[useAppStore] Locale "${lang}" not supported, using default`);
      return;
    }
    locale.value = lang;
  }

  /**
   * 切换语言
   */
  function toggleLocale() {
    const supportedLocales = appConfig.supportedLocales || ['zh-CN', 'en'];
    const currentIndex = supportedLocales.indexOf(locale.value);
    const nextIndex = (currentIndex + 1) % supportedLocales.length;
    setLocale(supportedLocales[nextIndex] ?? supportedLocales[0] ?? 'zh-CN');
  }

  /**
   * 设置主题
   */
  function setTheme(newTheme: typeof theme.value) {
    theme.value = newTheme;
    applyTheme();
  }

  /**
   * 切换主题（按当前显示效果翻转：浅色↔暗色，保证一次点击即生效）
   */
  function toggleTheme() {
    setTheme(isDarkTheme.value ? 'light' : 'dark');
  }

  /**
   * 应用主题到 DOM（dark 类 + 单一自定义主题类）
   */
  function applyTheme() {
    const root = document.documentElement;
    if (isDarkTheme.value) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.classList.remove('theme-brand', 'theme-china-red', 'theme-japanese', 'theme-middle-east', 'theme-southeast-asia');
    if (isBrandTheme.value) root.classList.add('theme-brand');
    else if (isChinaRedTheme.value) root.classList.add('theme-china-red');
    else if (isJapaneseTheme.value) root.classList.add('theme-japanese');
    else if (isMiddleEastTheme.value) root.classList.add('theme-middle-east');
    else if (isSoutheastAsiaTheme.value) root.classList.add('theme-southeast-asia');
  }

  /**
   * 切换侧边栏开关
   */
  function toggleSidebar() {
    sidebarOpened.value = !sidebarOpened.value;
  }

  /**
   * 设置侧边栏开关
   */
  function setSidebarOpened(opened: boolean) {
    sidebarOpened.value = opened;
  }

  /**
   * 切换侧边栏折叠
   */
  function toggleSidebarCollapsed() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  /**
   * 设置侧边栏折叠
   */
  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed;
  }

  /**
   * 设置设备类型
   */
  function setDevice(deviceType: 'desktop' | 'tablet' | 'mobile') {
    device.value = deviceType;
    if (deviceType === 'mobile') {
      setSidebarOpened(false);
    } else {
      // 桌面/平板始终默认打开侧栏，避免被旧缓存或异常状态导致一直关闭
      setSidebarOpened(true);
    }
  }

  /**
   * 检测并设置设备类型
   */
  function detectDevice() {
    const width = window.innerWidth;
    if (width < 768) {
      setDevice('mobile');
    } else if (width < 1024) {
      setDevice('tablet');
    } else {
      setDevice('desktop');
    }
  }

  /**
   * 设置全局 loading
   */
  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading;
  }

  /**
   * 设置页面 loading
   */
  function setPageLoading(loading: boolean) {
    pageLoading.value = loading;
  }

  /**
   * 初始化应用状态
   */
  function initApp() {
    detectDevice();
    applyTheme();
    
    // 监听窗口大小变化
    window.addEventListener('resize', detectDevice);
    
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'auto') {
        applyTheme();
      }
    });
  }

  return {
    // state
    locale,
    theme,
    sidebarOpened,
    sidebarCollapsed,
    device,
    globalLoading,
    pageLoading,
    // getters
    isMobile,
    isTablet,
    isDesktop,
    isDarkTheme,
    isBrandTheme,
    isChinaRedTheme,
    isJapaneseTheme,
    isMiddleEastTheme,
    isSoutheastAsiaTheme,
    // actions
    setLocale,
    toggleLocale,
    setTheme,
    toggleTheme,
    applyTheme,
    toggleSidebar,
    setSidebarOpened,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    setDevice,
    detectDevice,
    setGlobalLoading,
    setPageLoading,
    initApp,
  };
}, {
  // 持久化配置 - 使用固定 key
  // 注意：不要持久化 sidebarOpened，否则移动端从缓存恢复为 false 后点菜单无法打开
  persist: {
    key: 'app',
    storage: localStorage,
    paths: ['locale', 'theme', 'sidebarCollapsed'],
  } as { key: string; storage: Storage; paths: string[] },
});
