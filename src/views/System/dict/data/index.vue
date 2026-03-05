<template>
  <div class="page-root w-full h-full overflow-auto bg-white dark:bg-gray-900">
    <div class="p-6 w-full">
      <div class="mb-6 w-full">
        <el-form
          class="-mb-15px"
          :model="queryParams"
          ref="queryFormRef"
          :inline="true"
          label-width="68px"
        >
          <el-form-item label="字典名称" prop="dictType">
            <el-select v-model="queryParams.dictType" class="!w-240px" @change="dictChange">
              <el-option
                v-for="item in dictTypeList"
                :key="item.type"
                :label="item.name"
                :value="item.type"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="字典标签" prop="label">
            <el-input
              v-model="queryParams.label"
              placeholder="请输入字典标签"
              clearable
              class="!w-240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="数据状态" clearable class="!w-240px">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button class="text-gray-600 dark:text-gray-300" @click="handleQuery">
              <Icon icon="ep:search" class="mr-5px text-inherit" /> 搜索
            </el-button>
            <el-button class="text-gray-600 dark:text-gray-300" @click="resetQuery">
              <Icon icon="ep:refresh" class="mr-5px text-inherit" /> 重置
            </el-button>
            <el-button
              type="primary"
              plain
              @click="openForm('create')"
              v-permission="['system:dict:create']"
            >
              <Icon icon="ep:plus" class="mr-5px text-inherit" /> 新增
            </el-button>
            <el-button
              type="success"
              plain
              :loading="exportLoading"
              @click="handleExport"
              v-permission="['system:dict:export']"
            >
              <Icon icon="ep:download" class="mr-5px text-inherit" /> 导出
            </el-button>
            <el-button
              type="danger"
              plain
              :disabled="checkedIds.length === 0"
              @click="handleDeleteBatch"
              v-permission="['system:dict:delete']"
            >
              <Icon icon="ep:delete" class="mr-5px text-inherit" /> 批量删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="w-full overflow-x-auto mb-6">
        <el-table v-loading="loading" :data="list" @selection-change="handleRowCheckboxChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="字典编码" align="center" prop="id" />
          <el-table-column label="字典标签" align="center" prop="label" />
          <el-table-column label="字典键值" align="center" prop="value" />
          <el-table-column label="字典排序" align="center" prop="sort" />
          <el-table-column label="状态" align="center" prop="status">
            <template #default="scope">
              <DictTag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="颜色类型" align="center" prop="colorType" />
          <el-table-column label="CSS Class" align="center" prop="cssClass" />
          <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
          <el-table-column
            label="创建时间"
            align="center"
            prop="createTime"
            width="180"
            :formatter="(row: unknown, _col: unknown, val: string) => dateFormatter(row, _col, val)"
          />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="openForm('update', scope.row.id)"
                v-permission="['system:dict:update']"
              >
                修改
              </el-button>
              <el-button
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
                v-permission="['system:dict:delete']"
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

    <DictDataForm ref="formRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import download from '@/utils/download';
import * as DictDataApi from '@/api/system/dict/dict.data';
import * as DictTypeApi from '@/api/system/dict/dict.type';
import DictDataForm from './DictDataForm.vue';
import DictTag from '@/components/DictTag/index.vue';
import { useMessage } from '@/hooks/useMessage';
import { useRoute } from 'vue-router';

defineOptions({ name: 'SystemDictData' });

const message = useMessage();
const { t } = useI18n();
const route = useRoute();

const loading = ref(true);
const total = ref(0);
const list = ref<DictDataApi.DictDataVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  label: '',
  status: undefined as number | undefined,
  dictType: (route.params.dictType as string) || '',
});
const queryFormRef = ref();
const exportLoading = ref(false);
const dictTypeList = ref<DictTypeApi.DictTypeVO[]>([]);

const getList = async () => {
  loading.value = true;
  try {
    const data = await DictDataApi.getDictDataPage(queryParams);
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

const dictChange = (_v: string) => {
  handleQuery();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const formRef = ref<InstanceType<typeof DictDataForm>>();
const openForm = (type: string, id?: number) => {
  formRef.value?.open(type, id, queryParams.dictType);
};

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm();
    await DictDataApi.deleteDictData(id);
    message.success(t('common.delSuccess'));
    await getList();
  } catch {
    // 用户取消
  }
};

const checkedIds = ref<number[]>([]);
const handleRowCheckboxChange = (rows: DictDataApi.DictDataVO[]) => {
  checkedIds.value = rows.map((r) => r.id);
};

const handleDeleteBatch = async () => {
  try {
    await message.delConfirm();
    await DictDataApi.deleteDictDataList(checkedIds.value);
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
    const data = await DictDataApi.exportDictData(queryParams);
    download.excel(data, '字典数据.xls');
  } catch {
    // 用户取消
  } finally {
    exportLoading.value = false;
  }
};

onMounted(async () => {
  await getList();
  dictTypeList.value = await DictTypeApi.getSimpleDictTypeList();
});
</script>
