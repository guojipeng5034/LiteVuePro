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
          <el-form-item label="部门名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入部门名称"
              clearable
              class="!w-240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="部门状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择部门状态"
              clearable
              class="!w-240px"
            >
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
              v-permission="['system:dept:create']"
            >
              <Icon icon="ep:plus" class="mr-5px text-inherit" /> 新增
            </el-button>
            <el-button type="danger" plain @click="toggleExpandAll">
              <Icon icon="ep:sort" class="mr-5px text-inherit" /> 展开/折叠
            </el-button>
            <el-button
              type="danger"
              plain
              :disabled="checkedIds.length === 0"
              @click="handleDeleteBatch"
              v-permission="['system:dept:delete']"
            >
              <Icon icon="ep:delete" class="mr-5px text-inherit" /> 批量删除
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="w-full overflow-x-auto mb-6">
        <el-table
          v-loading="loading"
          :data="list"
          row-key="id"
          :default-expand-all="isExpandAll"
          v-if="refreshTable"
          @selection-change="handleRowCheckboxChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="部门名称" />
          <el-table-column prop="leader" label="负责人">
            <template #default="scope">
              {{ userList.find((u) => u.id === scope.row.leaderUserId)?.nickname ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" />
          <el-table-column prop="status" label="状态">
            <template #default="scope">
              <DictTag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
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
                v-permission="['system:dept:update']"
              >
                修改
              </el-button>
              <el-button
                :disabled="deletingId === scope.row.id"
                link
                type="danger"
                @click="handleDelete(scope.row.id)"
                v-permission="['system:dept:delete']"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <DeptForm ref="formRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import { handleTree } from '@/utils/tree';
import * as DeptApi from '@/api/system/dept';
import * as UserApi from '@/api/system/user';
import DeptForm from './DeptForm.vue';
import DictTag from '@/components/DictTag/index.vue';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemDept' });

const message = useMessage();
const { t } = useI18n();

const loading = ref(true);
const deletingId = ref<number | null>(null);
const list = ref<DeptApi.DeptVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  name: undefined as string | undefined,
  status: undefined as number | undefined,
});
const queryFormRef = ref();
const isExpandAll = ref(true);
const refreshTable = ref(true);
const userList = ref<UserApi.UserVO[]>([]);

const getList = async () => {
  loading.value = true;
  try {
    const data = await DeptApi.getDeptList(queryParams);
    list.value = handleTree(Array.isArray(data) ? data : [], 'id', 'parentId', 'children');
  } finally {
    loading.value = false;
  }
};

const toggleExpandAll = () => {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
};

const handleQuery = () => getList();

const resetQuery = () => {
  queryParams.pageNo = 1;
  queryFormRef.value?.resetFields();
  handleQuery();
};

const formRef = ref<InstanceType<typeof DeptForm>>();
const openForm = (type: string, id?: number) => {
  formRef.value?.open(type, id);
};

const handleDelete = async (id: number) => {
  if (deletingId.value === id) return;
  try {
    await message.delConfirm();
    deletingId.value = id;
    try {
      await DeptApi.deleteDept(id);
      message.success(t('common.delSuccess'));
      await getList();
    } finally {
      deletingId.value = null;
    }
  } catch {
    // 用户取消
  }
};

const checkedIds = ref<number[]>([]);
const handleRowCheckboxChange = (rows: DeptApi.DeptVO[]) => {
  checkedIds.value = rows.map((r) => r.id);
};

const handleDeleteBatch = async () => {
  try {
    await message.delConfirm();
    await DeptApi.deleteDeptList(checkedIds.value);
    checkedIds.value = [];
    message.success(t('common.delSuccess'));
    await getList();
  } catch {
    // 用户取消
  }
};

onMounted(async () => {
  await getList();
  userList.value = await UserApi.getSimpleUserList();
});
</script>
