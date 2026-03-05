/**
 * Vite 插件集合（Vue、UnoCSS、Element Plus 按需加载）
 */
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import type { Plugin } from 'vite';

export function createVitePlugins(): Plugin[] {
  const plugins: (Plugin | Plugin[])[] = [
    vue(),
    UnoCSS(),
    AutoImport({
      imports: [
        'vue',
        {
          from: 'element-plus',
          imports: ['ElMessage', 'ElMessageBox', 'ElNotification', 'ElLoading'],
        },
      ],
      dts: 'types/auto-imports.d.ts',
      dirs: ['src/composables', 'src/utils'],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: false, directives: true }), // 全量样式见 main.ts
      ],
      dts: 'types/components.d.ts',
      dirs: ['src/components'],
    }),
  ];
  return plugins.flat();
}
