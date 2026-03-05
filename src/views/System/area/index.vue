<template>
  <div class="page-root w-full h-full overflow-auto bg-white dark:bg-gray-900">
    <div class="p-6 w-full">
      <div class="mb-6 w-full">
        <el-button type="primary" plain @click="openForm()">
          <Icon icon="ep:plus" class="mr-5px text-inherit" /> IP 查询
        </el-button>
      </div>

      <div class="w-full overflow-x-auto mb-6">
        <div class="w-full" style="height: 400px">
          <el-auto-resizer>
            <template #default="{ height, width }">
              <el-table-v2
                v-loading="loading"
                :columns="columns"
                :data="list"
                :width="width"
                :height="height"
                expand-column-key="id"
              />
            </template>
          </el-auto-resizer>
        </div>
      </div>
    </div>

    <AreaForm ref="formRef" />
  </div>
</template>

<script setup lang="tsx">
import type { Column } from 'element-plus';
import * as AreaApi from '@/api/system/area';
import AreaForm from './AreaForm.vue';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemArea' });

const columns: Column[] = [
  { dataKey: 'id', title: '编号', width: 120, key: 'id' },
  { dataKey: 'name', title: '地名', width: 200 },
];

const loading = ref(true);
const list = ref<AreaApi.AreaVO[]>([]);

const getList = async () => {
  loading.value = true;
  try {
    list.value = await AreaApi.getAreaTree();
  } finally {
    loading.value = false;
  }
};

const formRef = ref<InstanceType<typeof AreaForm>>();
const openForm = () => {
  formRef.value?.open();
};

onMounted(() => {
  getList();
});
</script>
