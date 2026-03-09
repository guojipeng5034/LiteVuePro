<template>
  <div
    class="campus-top-login relative w-full min-h-screen flex flex-col lg:flex-row overflow-x-hidden overflow-y-auto transition-colors duration-500"
    :style="{ ...seasonVars, backgroundColor: 'var(--s-bg)' }"
  >
    <!-- 四季粒子效果层 -->
    <canvas
      ref="canvasRef"
      class="pointer-events-none fixed inset-0 z-20"
    />

    <!-- 季节切换器 -->
    <SeasonPicker v-model="season" />

    <!-- 左侧品牌区 -->
    <aside
      class="campus-top-login__brand relative z-10 flex-shrink-0 w-full lg:w-[min(50%,460px)] flex flex-col justify-center py-14 lg:py-20 pl-10 pr-8 lg:pl-20 lg:pr-12 order-2 lg:order-1"
    >
      <div class="relative z-1 max-w-sm mx-auto lg:mx-0 w-full">
        <!-- Logo -->
        <div class="campus-top-login__logo-wrap">
          <video
            class="campus-top-login__logo"
            :src="logoVideoSrc"
            autoplay
            loop
            muted
            playsinline
            aria-label="LiteVuePro"
          />
        </div>
        <div
          class="text-base ml-8 leading-relaxed transition-colors duration-500 font-body max-w-[26ch]"
          style="color: var(--s-primary)"
        >
          <div
            class="mt-2 h-0.5 mb-4 w-[70%] rounded-full transition-colors duration-500"
            style="background-color: var(--s-primary)"
            aria-hidden="true"
          />
          {{ t('login.brandSubtitle') }}
        </div>

        <!-- 信任标签 -->
        <div class="mt-10 ml-4 flex flex-wrap gap-3" aria-hidden="true">
          <span
            class="campus-top-login__trust-tag inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-500 cursor-default"
          >
            <Icon icon="mdi:shield-check-outline" :size="18" class="flex-shrink-0" />
            {{ t('login.trustSecurity') }}
          </span>
          <span
            class="campus-top-login__trust-tag inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium bg-white/80 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-600 shadow-sm transition-colors duration-500 cursor-default"
          >
            <Icon icon="mdi:school-outline" :size="18" class="flex-shrink-0" />
            {{ t('login.trustEdu') }}
          </span>
        </div>
      </div>
    </aside>

    <!-- 右侧登录表单区 -->
    <main
      class="campus-top-login__form relative z-10 flex-1 flex items-center justify-center px-4 py-12 lg:py-16 order-1 lg:order-2 min-w-0 lg:px-12"
    >
      <div
        class="campus-top-login__card w-full max-w-[400px] rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_10px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] p-9 transition-shadow duration-200 cursor-default hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_20px_40px_-8px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)]"
      >
        <div class="text-center mb-8">
          <h2
            class="text-xl font-bold text-[#0F172A] dark:text-gray-100 transition-colors duration-200 font-heading tracking-tight"
          >
            {{ t('login.title') }}
          </h2>
          <p
            class="mt-2 text-sm text-[#475569] dark:text-gray-400 transition-colors duration-200 font-body"
          >
            {{ t('login.subtitle') }}
          </p>
        </div>

        <el-form
          label-position="top"
          size="large"
          class="campus-top-login-form"
          @submit.prevent="onSubmitHandler"
        >
          <el-form-item :label="t('login.username')" :error="errors.username" class="campus-top-form-item">
            <el-input
              v-model="username"
              v-bind="usernameAttrs"
              :placeholder="t('login.usernamePlaceholder')"
              autocomplete="username"
              clearable
              class="campus-top-login-input rounded-xl"
            >
              <template #prefix>
                <Icon icon="mdi:account-outline" class="text-gray-500 dark:text-gray-400 flex-shrink-0" :size="20" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="t('login.password')" :error="errors.password" class="campus-top-form-item">
            <el-input
              v-model="password"
              v-bind="passwordAttrs"
              type="password"
              :placeholder="t('login.passwordPlaceholder')"
              autocomplete="current-password"
              show-password
              clearable
              class="campus-top-login-input rounded-xl"
            >
              <template #prefix>
                <Icon icon="mdi:lock-outline" class="text-gray-500 dark:text-gray-400 flex-shrink-0" :size="20" />
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="campus-top-form-item mb-0 mt-2">
            <el-button
              type="primary"
              native-type="button"
              class="campus-top-login-btn w-full h-12 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer"
              :loading="isSubmitting"
              @click="onSubmitHandler"
            >
              {{ isSubmitting ? t('common.loading') : t('login.submit') }}
            </el-button>
          </el-form-item>
        </el-form>

        <p
          class="mt-5 text-center text-xs text-[#64748b] dark:text-gray-500 transition-colors duration-200 font-body"
        >
          {{ t('login.mockTip') }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useUserStore } from '@/store/modules/user';
import { useSeasonEffect, SEASON_META } from '@/composables/useSeasonEffect';
import { useAppStore } from '@/store/modules/app';
import SeasonPicker from './SeasonPicker.vue';
import logoLightSrc from '@/assets/images/LiteVueProLogo-light.webm';
import logoDarkSrc from '@/assets/images/LiteVueProLogo-dark.webm';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const appStore = useAppStore();

const logoVideoSrc = computed(() =>
  appStore.isDarkTheme ? logoDarkSrc : logoLightSrc,
);

// ─── 四季粒子效果 ───
const canvasRef = ref<HTMLCanvasElement | null>(null);
const { season } = useSeasonEffect(canvasRef);

const seasonVars = computed(() => {
  const th = SEASON_META[season.value].theme;
  return {
    '--s-primary': th.primary,
    '--s-primary-hover': th.primaryHover,
    '--s-primary-light': th.primaryLight,
    '--s-primary-dark': th.primaryDark,
    '--s-primary-dark-hover': th.primaryDarkHover,
    '--s-bg': th.bg,
    '--s-bg-dark': th.bgDark,
  } as Record<string, string>;
});

const loginSchema = z.object({
  username: z.string().min(1, t('login.usernameRequired')),
  password: z.string().min(1, t('login.passwordRequired')),
});

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: { username: 'admin', password: '123456' },
});

const [username, usernameAttrs] = defineField('username');
const [password, passwordAttrs] = defineField('password');

/** handleSubmit 返回的事件处理器，校验通过后执行 onSubmit */
const onSubmitHandler = handleSubmit(onSubmit);

async function onSubmit() {
  try {
    await userStore.login({ username: username.value, password: password.value });
    const redirect = (route.query.redirect as string | undefined) ?? '/';
    await router.push(redirect);
  } catch (err) {
    const message = err instanceof Error ? err.message : t('login.loginFailed');
    ElMessage.error(message);
  }
}
</script>

<style scoped>
/* 使用系统字体栈，避免 Google Fonts 国内不可用导致加载阻塞 */
.font-heading {
  font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.font-body {
  font-family: system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 暗色模式背景 */
html.dark .campus-top-login {
  background-color: var(--s-bg-dark) !important;
}

/* 透明背景 logo 动画 */
.campus-top-login__logo {
  display: block;
  width: auto;
  max-width: 400px;
  height: 6rem;
  object-fit: contain;
  object-position: left center;
  transition: filter 0.5s ease;
}

/* 暗色 logo 已有独立资源，无需 CSS 反色 */

@media (min-width: 1024px) {
  .campus-top-login__logo {
    height: 6rem;
    max-width: 400px;
  }
}

/* 信任标签 — 跟随季节主题色 */
.campus-top-login__trust-tag {
  color: var(--s-primary);
}

html.dark .campus-top-login__trust-tag {
  color: var(--s-primary-dark);
}

.campus-top-login__trust-tag:hover {
  border-color: var(--s-primary) !important;
}

html.dark .campus-top-login__trust-tag:hover {
  border-color: var(--s-primary-dark) !important;
}

/* 表单 */
.campus-top-login-form :deep(.campus-top-form-item) {
  margin-bottom: 1.125rem;
}

.campus-top-login-form :deep(.el-form-item__label) {
  font-family: 'Source Sans 3', system-ui, sans-serif;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

html.dark .campus-top-login-form :deep(.el-form-item__label) {
  color: #e2e8f0;
}

.campus-top-login-form :deep(.el-input__wrapper) {
  border-radius: 0.75rem;
  padding: 0.5rem 1rem;
  min-height: 48px;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.campus-top-login-form :deep(.el-input__wrapper:hover),
.campus-top-login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--s-primary) inset;
}

/* 主按钮 — 跟随季节主题色 */
.campus-top-login-form :deep(.el-button--primary) {
  --el-button-bg-color: var(--s-primary);
  --el-button-border-color: var(--s-primary);
  --el-button-hover-bg-color: var(--s-primary-hover);
  --el-button-hover-border-color: var(--s-primary-hover);
  border-radius: 0.75rem;
  transition: background-color 0.5s ease, border-color 0.5s ease;
}

.campus-top-login-form :deep(.el-button--primary:focus),
.campus-top-login-form :deep(.el-button--primary:hover) {
  background-color: var(--s-primary-hover);
  border-color: var(--s-primary-hover);
}

@media (prefers-reduced-motion: reduce) {
  .campus-top-login,
  .campus-top-login__card,
  .campus-top-login-form :deep(.el-input__wrapper),
  .campus-top-login-btn,
  .campus-top-login__brand [class*='hover:'] {
    transition-duration: 0s;
  }
}
</style>
