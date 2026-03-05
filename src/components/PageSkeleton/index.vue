<template>
  <div class="page-skeleton p-6 w-full">
    <!-- 标题区占位 -->
    <div class="mb-6">
      <el-skeleton :rows="2" animated />
    </div>
    <!-- 筛选/操作区占位 -->
    <div class="mb-6 flex gap-4">
      <el-skeleton :rows="1" :style="{ width: '200px' }" animated />
      <el-skeleton :rows="1" :style="{ width: '200px' }" animated />
      <el-skeleton :rows="1" :style="{ width: '100px' }" animated />
    </div>
    <!-- 主内容区占位 -->
    <el-skeleton :rows="8" animated />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'PageSkeleton' });
</script>

<style scoped>
.page-skeleton {
  min-height: 200px;
}
</style>
