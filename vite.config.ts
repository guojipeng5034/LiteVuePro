import { resolve } from 'node:path';
import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import { webUpdateNotice } from '@plugin-web-update-notification/vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { createVitePlugins } from './build/vite/index.js';

const root = process.cwd();

function pathResolve(dir: string) {
  return resolve(root, dir);
}

async function loadViteConfig({
  command,
  mode,
}: ConfigEnv): Promise<UserConfig> {
  let effectiveMode = mode;
  if (command !== 'build' && process.argv[3] === '--mode') {
    effectiveMode = process.argv[4] ?? mode;
  }
  const env = loadEnv(effectiveMode, root, '');

  const pkg = await import('./package.json', { with: { type: 'json' } }).then(
    (m) => m.default
  );

  const base = './';
  const isProd = command === 'build';
  const srcPath = pathResolve('src');

  return {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
    },
    root,
    base,
    plugins: [
      ...createVitePlugins(),
      ...(isProd
        ? [
            {
              ...webUpdateNotice({
                versionType: 'pkg_version',
                checkInterval: 10 * 60 * 1000,
                checkOnWindowFocus: true,
                checkImmediately: true,
                checkOnLoadFileError: true,
                logVersion: true,
                hiddenDefaultNotification: false,
                hiddenDismissButton: false,
                injectFileBase: base,
                locale: 'zh_CN',
                notificationConfig: {
                  primaryColor: '#1677ff',
                  secondaryColor: 'rgba(0,0,0,.25)',
                  placement: 'bottomRight',
                },
                notificationProps: {
                  title: '系统更新',
                  description: '系统已更新，请刷新页面以获取最新版本',
                  buttonText: '刷新',
                  dismissButtonText: '暂不',
                },
              }),
              enforce: 'post' as const,
            },
          ]
        : []),
      createSvgIconsPlugin({
        iconDirs: [pathResolve('src/assets/icons/svg')],
        symbolId: 'icon-[name]',
      }),
    ],
    resolve: {
      alias: [
        { find: /@\//, replacement: `${pathResolve('src')}/` },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [srcPath],
          api: 'modern-compiler',
        },
      },
    },
    build: {
      outDir: 'dist',
      target: 'esnext',
      sourcemap: false,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
      rolldownOptions: {
        output: {
          manualChunks: (id) => {
            if (!id.includes('node_modules')) return;
            const chunkMap: Array<[RegExp, string]> = [
              [/element-plus|@element-plus/, 'element-plus'],
              [/@fullcalendar[/\\]/, 'fullcalendar'],
              [/vue-router/, 'vue-router'],
              [/pinia/, 'pinia'],
              [/vue-i18n|@intlify/, 'vue-i18n'],
              [/[\\/]vue[\\/]/, 'vue'],
              [/alova/, 'alova'],
              [/dayjs/, 'dayjs'],
              [/@iconify[/\\]/, 'iconify'],
              [/tinymce|@tinymce/, 'tinymce'],
              [/vee-validate|zod/, 'validation'],
            ];
            for (const [pattern, name] of chunkMap) {
              if (pattern.test(id)) return name;
            }
            return 'vendor';
          },
        },
      },
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        'element-plus/es/components/**',
        '@element-plus/icons-vue',
        'vue-i18n',
        'alova',
        'dayjs',
        '@fullcalendar/core',
        '@fullcalendar/vue3',
        '@iconify/vue',
        'vee-validate',
        'zod',
      ],
    },
    server: {
      port: Number(env.VITE_PORT) || 3000,
      host: '0.0.0.0',
      proxy: env.VITE_PROXY_TARGET
        ? {
            '/api': {
              target: env.VITE_PROXY_TARGET,
              changeOrigin: true,
            },
          }
        : undefined,
    },
  };
}

export default defineConfig(loadViteConfig);
