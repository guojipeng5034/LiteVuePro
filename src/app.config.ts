/**
 * 应用配置 - 单应用管理端
 */
export interface AppConfig {
  id?: number;
  label?: string;
  name?: string;
  api_url?: string;
  /** 是否使用后端 API 菜单（GET /api/auth/menus）作为侧栏来源，与首页/Demo 合并 */
  useApiMenu?: boolean;
  /** 开发环境下是否启用 MSW Mock */
  enableMsw?: boolean;
  feature_flags?: { [key: string]: boolean };
  supportedLocales?: string[];
  defaultLocale?: string;
  tabNav?: {
    showTabNav?: boolean;
    enablePageCache?: boolean;
    defaultPath?: string;
    tabPaths?: string[];
  };
}

const config: AppConfig = {
  id: 0,
  label: 'admin',
  name: '管理后台',
  api_url: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  useApiMenu: true,
  enableMsw: false,
  feature_flags: { showLegacyFeature: true },
  supportedLocales: ['zh-CN', 'en'],
  defaultLocale: 'zh-CN',
  tabNav: {
    showTabNav: true,
    enablePageCache: true,
    defaultPath: '/',
    tabPaths: [],
  },
};

export default config;
