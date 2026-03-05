/**
 * 应用配置 - 单应用管理端
 */
export interface AppConfig {
  id?: number;
  label?: string;
  name?: string;
  api_url?: string;
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
  api_url: 'https://api.example.com',
  enableMsw: true,
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
