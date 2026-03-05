<template>
  <div class="page-root w-full h-full overflow-auto bg-white dark:bg-gray-900">
    <div class="p-6 w-full">
      <div class="mb-6 w-full">
        <el-form
          ref="queryFormRef"
          :inline="true"
          :model="queryParams"
          class="-mb-15px"
          label-width="68px"
        >
          <el-form-item label="字典名称" prop="name">
            <el-input
              v-model="queryParams.name"
              class="!w-240px"
              clearable
              placeholder="请输入字典名称"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="字典类型" prop="type">
            <el-input
              v-model="queryParams.type"
              class="!w-240px"
              clearable
              placeholder="请输入字典类型"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              class="!w-240px"
              clearable
              placeholder="请选择字典状态"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item>
            <el-button class="text-gray-600 dark:text-gray-300" @click="handleQuery">
              <Icon class="mr-5px text-inherit" icon="ep:search" /> 搜索
            </el-button>
            <el-button class="text-gray-600 dark:text-gray-300" @click="resetQuery">
              <Icon class="mr-5px text-inherit" icon="ep:refresh" /> 重置
            </el-button>
            <el-button
              v-permission="['system:dict:create']"
              plain
              type="primary"
              @click="openForm('create')"
            >
              <Icon class="mr-5px text-inherit" icon="ep:plus" /> 新增
            </el-button>
            <el-button
              v-permission="['system:dict:export']"
              :loading="exportLoading"
              plain
              type="success"
              @click="handleExport"
            >
              <Icon class="mr-5px text-inherit" icon="ep:download" /> 导出
            </el-button>
            <el-button
              v-permission="['system:dict:delete']"
              :disabled="checkedIds.length === 0"
              plain
              type="danger"
              @click="handleDeleteBatch"
            >
              <Icon class="mr-5px text-inherit" icon="ep:delete" /> 批量删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="w-full overflow-x-auto mb-6">
        <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
          <el-table-column type="selection" width="55" />
          <el-table-column align="center" label="字典编号" prop="id" />
          <el-table-column align="center" label="字典名称" prop="name" show-overflow-tooltip />
          <el-table-column align="center" label="字典类型" prop="type" width="300" />
          <el-table-column align="center" label="状态" prop="status">
            <template #default="scope">
              <DictTag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="备注" prop="remark" />
          <el-table-column
            align="center"
            label="创建时间"
            prop="createTime"
            width="180"
            :formatter="(row: unknown, _col: unknown, val: string) => dateFormatter(row, _col, val)"
          />
          <el-table-column align="center" label="操作">
            <template #default="scope">
              <el-button
                v-permission="['system:dict:update']"
                link
                type="primary"
                @click="openForm('update', scope.row.id)"
              >
                修改
              </el-button>
              <router-link :to="`/system/dict/data/${scope.row.type}`">
                <el-button link type="primary">数据</el-button>
              </router-link>
              <el-button
                v-permission="['system:dict:delete']"
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-pagination
        v-model:current-page="queryParams.pageNo"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @current-change="getList"
        @size-change="getList"
      />
    </div>

    <DictTypeForm ref="formRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import * as DictTypeApi from '@/api/system/dict/dict.type';
import DictTypeForm from './DictTypeForm.vue';
import DictTag from '@/components/DictTag/index.vue';
import download from '@/utils/download';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemDictType' });

const message = useMessage();
const { t } = useI18n();

const loading = ref(true);
const total = ref(0);
const list = ref<DictTypeApi.DictTypeVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  type: '',
  status: undefined as number | undefined,
  createTime: [] as string[],
});
const queryFormRef = ref();
const exportLoading = ref(false);

const getList = async () => {
  loading.value = true;
  try {
    const data = await DictTypeApi.getDictTypePage(queryParams);
    list.value = data.list ?? [];
    total.value = data.total ?? 0;
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNo = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const formRef = ref<InstanceType<typeof DictTypeForm>>();
const openForm = (type: string, id?: number) => {
  formRef.value?.open(type, id);
};

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm();
    await DictTypeApi.deleteDictType(id);
    message.success(t('common.delSuccess'));
    await getList();
  } catch {
    // 用户取消
  }
};

const checkedIds = ref<number[]>([]);
const handleRowCheckboxChange = (rows: DictTypeApi.DictTypeVO[]) => {
  checkedIds.value = rows.map((r) => r.id);
};

const handleDeleteBatch = async () => {
  try {
    await message.delConfirm();
    await DictTypeApi.deleteDictTypeList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'));
    await getList();
  } catch {
    // 用户取消
  }
};

const handleExport = async () => {
  try {
    await message.exportConfirm();
    exportLoading.value = true;
    const data = await DictTypeApi.exportDictType(queryParams);
    download.excel(data, '字典类型.xls');
  } catch {
    // 用户取消
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  getList();
});
</script>
