# Pinia 状态管理指南

本文档详细说明 LiteVuePro 框架中 Pinia 的集成方案、核心模块、工具函数与最佳实践。

---

## 目录

1. [架构设计](#架构设计)
2. [核心 Store 模块](#核心-store-模块)
3. [工具与 Composables](#工具与-composables)
4. [插件系统](#插件系统)
5. [持久化](#持久化)
6. [使用示例](#使用示例)
7. [最佳实践](#最佳实践)

---

## 架构设计

### 设计原则

1. **模块化** - 按业务领域划分 store 模块
2. **类型安全** - 完整的 TypeScript 类型定义
3. **持久化** - 自动持久化关键状态到 localStorage
4. **持久化** - 关键状态自动持久化到 localStorage
5. **可扩展** - 插件化架构,易于扩展功能

### 目录结构

```
src/store/
├── index.ts                    # Pinia 实例创建与配置
├── modules/                    # Store 模块
│   ├── user.ts                # 用户状态 (登录、权限)
│   ├── app.ts                 # 应用全局状态 (语言、主题)
│   ├── featureFlags.ts        # Feature Flags (A/B 测试)
│   └── cache.ts               # 应用缓存
├── composables/                # 可复用的 composables
│   ├── useStoreWithLoading.ts # Loading 状态管理
│   └── useStoreWithPagination.ts # 分页管理
├── plugins/                    # Pinia 插件
│   ├── logger.ts              # 开发日志插件
│   └── analytics.ts           # 埋点追踪插件
└── utils/
    └── storeHelpers.ts        # Store 工具函数
```

---

## 核心 Store 模块

### 1. User Store (用户状态)

**功能**:
- 用户登录/登出
- Token 管理 (自动刷新)
- 用户信息缓存
- 权限判断

**使用示例**:

```ts
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();

// 登录
await userStore.login({ username: 'admin', password: '123456' });

// 获取用户信息
console.log(userStore.username); // 'admin'
console.log(userStore.isLoggedIn); // true

// 权限判断
if (userStore.hasPermission('admin:write')) {
  // 执行操作
}

// 登出
await userStore.logout();
```

**持久化**: Token、refreshToken、userInfo、loginTime 自动持久化到 localStorage。

---

### 2. App Store (应用全局状态)

**功能**:
- 语言切换
- 主题管理 (light/dark/auto)
- 侧边栏状态
- 设备类型检测 (desktop/tablet/mobile)
- 全局 loading

**使用示例**:

```ts
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();

// 初始化 (已在 main.ts 中自动调用)
appStore.initApp();

// 语言切换
appStore.setLocale('en');
appStore.toggleLocale(); // 循环切换

// 主题切换
appStore.setTheme('dark');
appStore.toggleTheme(); // light -> dark -> auto -> light

// 设备类型
console.log(appStore.isMobile); // false
console.log(appStore.device); // 'desktop'

// 侧边栏
appStore.toggleSidebar();
appStore.setSidebarCollapsed(true);

// Loading
appStore.setGlobalLoading(true);
```

**持久化**: locale、theme、sidebarCollapsed 持久化。

---

### 3. Feature Flags Store (功能开关)

**功能**:
- 从应用配置加载 feature flags
- 集成 GrowthBook 进行 A/B 测试
- 运行时覆盖 (开发/测试)

**使用示例**:

```ts
import { useFeatureFlagsStore } from '@/store/modules/featureFlags';

const featureFlagsStore = useFeatureFlagsStore();

// 初始化 (已在 main.ts 中自动调用)
await featureFlagsStore.init();

// 判断功能是否启用
if (featureFlagsStore.isEnabled('newUI')) {
  // 显示新 UI
}

// 获取功能配置值
const buttonColor = featureFlagsStore.getFeatureValue('buttonColor', 'blue');

// 开发环境覆盖 (仅用于测试)
if (import.meta.env.DEV) {
  featureFlagsStore.setOverride('newUI', true);
}

// 刷新 (从 GrowthBook 重新加载)
await featureFlagsStore.refresh();
```

**数据来源优先级**: 运行时覆盖 > GrowthBook > 应用配置

---

### 4. Cache Store (应用缓存)

**功能**:
- 内存缓存 (快速访问)
- 持久化缓存 (localStorage)
- TTL 过期机制
- 持久化

**使用示例**:

```ts
import { useCacheStore } from '@/store/modules/cache';

const cacheStore = useCacheStore();

// 设置缓存 (30分钟 TTL)
cacheStore.set('userList', users, { ttl: 30 * 60 * 1000 });

// 获取缓存
const users = cacheStore.get<User[]>('userList');

// 设置持久化缓存
cacheStore.set('settings', settings, { persist: true });

// 检查缓存是否存在
if (cacheStore.has('userList')) {
  // 缓存存在且未过期
}

// 删除缓存
cacheStore.remove('userList');

// 清空所有缓存
cacheStore.clear();

// 清理过期缓存
cacheStore.cleanExpired();

// 获取缓存统计
const stats = cacheStore.getStats();
console.log(stats); // { total: 10, expired: 2, persistent: 5, memory: 5 }
```

---

## 工具与 Composables

### 1. useStoreWithLoading (Loading 状态管理)

为异步 store action 提供 loading 状态管理。

**使用示例**:

```ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStoreWithLoading } from '@/store/composables/useStoreWithLoading';

export const useProductStore = defineStore('product', () => {
  const { loading, withLoading } = useStoreWithLoading();
  
  const products = ref([]);
  
  // 自动管理 loading 状态
  const fetchProducts = withLoading(async () => {
    const res = await api.getProducts();
    products.value = res.data;
  });
  
  return { products, loading, fetchProducts };
});
```

**组件中使用**:

```vue
<template>
  <div v-loading="productStore.loading">
    <div v-for="product in productStore.products" :key="product.id">
      {{ product.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '@/store/modules/product';

const productStore = useProductStore();
productStore.fetchProducts();
</script>
```

---

### 2. useStoreWithPagination (分页管理)

为 store 提供完整的分页状态和操作。

**使用示例**:

```ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStoreWithPagination } from '@/store/composables/useStoreWithPagination';

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([]);
  
  const pagination = useStoreWithPagination<Product>({
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

**组件中使用**:

```vue
<template>
  <div>
    <div v-for="product in productStore.products" :key="product.id">
      {{ product.name }}
    </div>
    
    <el-pagination
      :current-page="productStore.currentPage"
      :page-size="productStore.currentPageSize"
      :total="productStore.total"
      @current-change="productStore.goToPage"
      @size-change="productStore.changePageSize"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from '@/store/modules/product';

const productStore = useProductStore();

onMounted(() => {
  productStore.fetch();
});
</script>
```

---

### 3. Store Helpers (工具函数)

```ts
import { 
  resetStores, 
  persistStore, 
  restoreStore,
  subscribeStore,
  batchUpdateStore,
  snapshotStore,
} from '@/store/utils/storeHelpers';

// 重置多个 store
resetStores([userStore, appStore]);

// 手动持久化 store
persistStore(userStore, 'backup-20240101');

// 恢复 store
restoreStore(userStore, 'backup-20240101');

// 订阅 store 变化
const unsubscribe = subscribeStore(userStore, (mutation, state) => {
  console.log('User store changed:', mutation.type);
});

// 批量更新 (只触发一次响应式更新)
batchUpdateStore(userStore, {
  token: 'new-token',
  userInfo: { ...newUserInfo },
});

// 创建状态快照
const snapshot = snapshotStore(userStore);
```

---

## 插件系统

### 1. Logger 插件 (开发环境日志)

自动记录 store 的状态变化和 action 调用。

**配置** (在 `main.ts` 中):

```ts
import { piniaLogger } from '@/store/plugins/logger';

pinia.use(piniaLogger({
  logActions: true,      // 记录 action 调用
  logState: false,       // 不记录状态变化 (太多日志)
  exclude: ['cache'],    // 排除 cache store
  collapsed: true,       // 折叠日志组
}));
```

---

### 2. Analytics 插件 (埋点追踪)

自动追踪 store action 调用,发送到 Matomo。

**配置** (在 `main.ts` 中):

```ts
import { piniaAnalytics } from '@/store/plugins/analytics';

pinia.use(piniaAnalytics({
  enabled: import.meta.env.PROD,  // 仅生产环境启用
  include: ['user', 'product'],   // 只追踪指定 store
  trackActions: [                 // 只追踪指定 action
    'user.login',
    'user.logout',
    'product.purchase',
  ],
}));
```

**自定义处理器**:

```ts
pinia.use(piniaAnalytics({
  customHandler: (storeName, actionName, args) => {
    // 自定义埋点逻辑
    console.log(`Action called: ${storeName}.${actionName}`, args);
  },
}));
```

---

## 持久化

### 存储 key

持久化使用固定 key：`app`、`user`、`tabnav`、`cache-*`。

```ts
// User Store
persist: { key: 'user', storage: localStorage, paths: ['token', 'refreshToken', 'userInfo'] }

// App Store
persist: { key: 'app', storage: localStorage, paths: ['locale', 'theme'] }
```

---

## 使用示例

### 示例 1: 用户登录流程

```vue
<template>
  <el-form @submit.prevent="handleLogin">
    <el-form-item label="用户名">
      <el-input v-model="form.username" />
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password" />
    </el-form-item>
    <el-button type="primary" :loading="userStore.loading" @click="handleLogin">
      登录
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/modules/user';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: '',
  password: '',
});

async function handleLogin() {
  try {
    await userStore.login(form);
    ElMessage.success('登录成功');
    router.push('/');
  } catch (error) {
    ElMessage.error('登录失败');
  }
}
</script>
```

---

### 示例 2: 权限控制

```vue
<template>
  <div>
    <!-- 基于权限显示按钮 -->
    <el-button v-if="userStore.hasPermission('admin:write')" type="primary">
      新建
    </el-button>
    
    <!-- 基于角色显示内容 -->
    <div v-if="userStore.hasRole('admin')">
      管理员面板
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
</script>
```

---

### 示例 3: Feature Flag 控制

```vue
<template>
  <div>
    <!-- 旧版 UI -->
    <OldUI v-if="!featureFlagsStore.isEnabled('newUI')" />
    
    <!-- 新版 UI (A/B 测试) -->
    <NewUI v-else />
    
    <!-- 根据配置值显示不同样式 -->
    <el-button :type="buttonVariant">
      提交
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFeatureFlagsStore } from '@/store/modules/featureFlags';

const featureFlagsStore = useFeatureFlagsStore();

const buttonVariant = computed(() => 
  featureFlagsStore.getFeatureValue('buttonColor', 'primary')
);
</script>
```

---

### 示例 4: 主题切换

```vue
<template>
  <el-switch
    v-model="isDark"
    active-text="深色"
    inactive-text="浅色"
    @change="handleThemeChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/modules/app';

const appStore = useAppStore();

const isDark = computed({
  get: () => appStore.theme === 'dark',
  set: (value) => appStore.setTheme(value ? 'dark' : 'light'),
});

function handleThemeChange(value: boolean) {
  console.log('Theme changed:', value ? 'dark' : 'light');
}
</script>
```

---

## 最佳实践

### 1. Store 命名规范

- Store 模块名使用小驼峰: `user`、`featureFlags`
- Store 导出使用 `useXxxStore` 形式: `useUserStore`、`useAppStore`
- Action 使用动词: `login`、`fetchProducts`、`setLocale`

### 2. 状态设计原则

- **最小化** - 只存储必要的状态
- **扁平化** - 避免深层嵌套
- **规范化** - 列表数据使用 Map/Object 存储,避免数组查找
- **计算属性** - 派生状态使用 computed

### 3. 持久化策略

- **Token** - 必须持久化 (localStorage)
- **用户偏好** - 持久化 (localStorage)
- **临时数据** - 不持久化 (仅内存)
- **敏感信息** - 加密后持久化或使用 sessionStorage

### 4. 性能优化

- **按需加载** - 大型 store 使用动态导入
- **分页数据** - 使用 `useStoreWithPagination`
- **缓存策略** - 使用 `useCacheStore` 缓存 API 结果
- **批量更新** - 使用 `$patch` 或 `batchUpdateStore`

### 5. 错误处理

```ts
export const useProductStore = defineStore('product', () => {
  const { loading, error, withLoading } = useStoreWithLoading();
  
  const fetchProducts = withLoading(async () => {
    try {
      const res = await api.getProducts();
      return res.data;
    } catch (err) {
      ElMessage.error('获取商品列表失败');
      throw err; // 让 withLoading 捕获错误
    }
  });
  
  return { loading, error, fetchProducts };
});
```

### 6. TypeScript 类型定义

```ts
// 定义接口
export interface Product {
  id: number;
  name: string;
  price: number;
}

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([]);
  
  // 明确返回类型
  async function fetchProducts(): Promise<Product[]> {
    const res = await api.getProducts();
    products.value = res.data;
    return res.data;
  }
  
  return { products, fetchProducts };
});
```

---

## 与现有架构集成

### 与 Alova (HTTP) 集成

```ts
import { useRequest } from 'alova';
import { defineStore } from 'pinia';

export const useProductStore = defineStore('product', () => {
  const { loading, data, error, send } = useRequest(
    () => api.getProducts(),
    { immediate: false }
  );
  
  return {
    products: data,
    loading,
    error,
    fetchProducts: send,
  };
});
```

### 与 vue-i18n 集成

```ts
import { useAppStore } from '@/store/modules/app';
import { useI18n } from 'vue-i18n';

// 监听 store locale 变化,同步到 i18n
const appStore = useAppStore();
const { locale } = useI18n();

watch(() => appStore.locale, (newLocale) => {
  locale.value = newLocale;
});
```

### 与 Vue Router 集成

```ts
// 路由守卫中使用 store
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});
```

---

## 总结

Pinia 在 LiteVuePro 中的集成提供了:

✅ **完整的状态管理方案** - 用户、应用、缓存、Feature Flags  
✅ **持久化** - 关键状态自动持久化  
✅ **自动持久化** - 关键状态自动保存到 localStorage  
✅ **插件化扩展** - Logger、Analytics 等  
✅ **丰富的工具集** - Loading、Pagination、Helpers  
✅ **类型安全** - 完整的 TypeScript 支持  
✅ **开发友好** - 详细的日志和调试工具  

---

## 参考资源

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)
- [LiteVuePro 技术架构文档](./ARCHITECTURE.md)
