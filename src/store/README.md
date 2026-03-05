# Store 目录说明

本目录包含基于 Pinia 的状态管理实现，为 LiteVuePro 企业级管理端框架提供完整的状态管理方案。

---

## 目录结构

```
store/
├── index.ts                    # Pinia 实例创建与配置
├── modules/                    # Store 模块
│   ├── user.ts                # 用户状态管理
│   ├── app.ts                 # 应用全局状态
│   ├── featureFlags.ts        # Feature Flags 管理
│   └── cache.ts               # 应用缓存管理
├── composables/                # 可复用的 Composables
│   ├── useStoreWithLoading.ts # Loading 状态管理
│   └── useStoreWithPagination.ts # 分页管理
├── plugins/                    # Pinia 插件
│   ├── logger.ts              # 开发日志插件
│   └── analytics.ts           # 埋点追踪插件
└── utils/
    └── storeHelpers.ts        # Store 工具函数
```

---

## 核心模块

### 1. User Store (`modules/user.ts`)

**功能**:
- 用户登录/登出
- Token 自动管理与刷新
- 用户信息缓存
- 权限与角色判断

**使用**:
```ts
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
await userStore.login({ username, password });
if (userStore.hasPermission('admin:write')) { /* ... */ }
```

---

### 2. App Store (`modules/app.ts`)

**功能**:
- 多语言切换
- 主题管理 (light/dark/auto)
- 侧边栏状态
- 设备类型检测
- 全局 Loading

**使用**:
```ts
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();
appStore.setLocale('en');
appStore.setTheme('dark');
```

---

### 3. Feature Flags Store (`modules/featureFlags.ts`)

**功能**:
- 从应用配置加载功能开关
- 集成 GrowthBook 进行 A/B 测试
- 运行时覆盖 (开发/测试)

**使用**:
```ts
import { useFeatureFlagsStore } from '@/store/modules/featureFlags';

const featureFlagsStore = useFeatureFlagsStore();
if (featureFlagsStore.isEnabled('newFeature')) { /* ... */ }
```

---

### 4. Cache Store (`modules/cache.ts`)

**功能**:
- 内存缓存 (快速访问)
- 持久化缓存 (localStorage)
- TTL 过期机制
- 持久化 key：app、user、tabnav、cache-*

**使用**:
```ts
import { useCacheStore } from '@/store/modules/cache';

const cacheStore = useCacheStore();
cacheStore.set('key', value, { ttl: 60000, persist: true });
const value = cacheStore.get('key');
```

---

## Composables

### useStoreWithLoading

为异步 store action 提供自动 loading 状态管理。

**使用**:
```ts
import { useStoreWithLoading } from '@/store/composables/useStoreWithLoading';

export const useProductStore = defineStore('product', () => {
  const { loading, withLoading } = useStoreWithLoading();
  
  const fetchProducts = withLoading(async () => {
    // API 调用
  });
  
  return { loading, fetchProducts };
});
```

---

### useStoreWithPagination

为 store 提供完整的分页状态和操作。

**使用**:
```ts
import { useStoreWithPagination } from '@/store/composables/useStoreWithPagination';

export const useProductStore = defineStore('product', () => {
  const products = ref([]);
  
  const pagination = useStoreWithPagination({
    pageSize: 20,
    fetchFn: async (page, pageSize) => {
      const res = await api.getProducts({ page, pageSize });
      products.value = res.list;
      return res;
    },
  });
  
  return { products, ...pagination };
});
```

---

## 插件

### Logger 插件 (`plugins/logger.ts`)

开发环境自动记录 store 的状态变化和 action 调用。

**配置** (已在 `main.ts` 中配置):
```ts
pinia.use(piniaLogger({
  logActions: true,
  logState: false,
  exclude: ['cache'],
}));
```

---

### Analytics 插件 (`plugins/analytics.ts`)

生产环境自动追踪 store action 调用,发送到 Matomo。

**配置** (已在 `main.ts` 中配置):
```ts
pinia.use(piniaAnalytics({
  enabled: import.meta.env.PROD,
  include: ['user'],
  trackActions: ['user.login', 'user.logout'],
}));
```

---

## 工具函数

### Store Helpers (`utils/storeHelpers.ts`)

提供常用的 store 操作工具:

- `resetStores()` - 批量重置 store
- `persistStore()` - 手动持久化 store
- `restoreStore()` - 恢复 store 状态
- `subscribeStore()` - 订阅 store 变化
- `batchUpdateStore()` - 批量更新 store
- `snapshotStore()` - 创建状态快照

---

### 持久化 key

单应用模式下，持久化 key 为固定值：`app`、`user`、`tabnav`、`cache-*`。

---

## 快速开始

1. **查看示例**: 访问 `/pinia` 路由查看完整 Demo
2. **阅读文档**: [PINIA_GUIDE.md](../../../docs/PINIA_GUIDE.md) - 状态管理完整指南
3. **参考实现**: 查看 `modules/` 下的 Store 实现

---

## 最佳实践

1. ✅ **模块化**: 按业务领域划分 store
2. ✅ **类型安全**: 使用 TypeScript 定义接口
3. ✅ **持久化策略**: Token 必须持久化,临时数据不持久化
4. ✅ **命名规范**: Store 使用 `useXxxStore`,action 使用动词
5. ✅ **性能优化**: 使用 composables 避免重复代码
6. ✅ **错误处理**: 在 action 中妥善处理异常
7. ✅ **调试工具**: 使用 Vue DevTools 和 Logger 插件

---

## 相关文档

- [技术架构文档](../../../docs/ARCHITECTURE.md)
- [Pinia 官方文档](https://pinia.vuejs.org/)
- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
