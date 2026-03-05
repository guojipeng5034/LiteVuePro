<template>
  <div />
</template>

<script setup lang="ts">
/**
 * 刷新当前页用：从 /redirect/xxx 立刻 replace 回真实 path，使 keep-alive 下的组件重新挂载
 */
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const path = route.params.path;
  let realPath = '/';
  if (typeof path === 'string') realPath = `/${path}`;
  else if (Array.isArray(path)) realPath = `/${path.join('/')}`;
  const query = { ...route.query };
  router.replace({ path: realPath, query }).catch(() => {});
});
</script>
