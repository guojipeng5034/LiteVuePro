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
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="queryParams.username"
              class="!w-240px"
              clearable
              placeholder="请输入用户名"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="queryParams.nickname"
              class="!w-240px"
              clearable
              placeholder="请输入昵称"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="请选择状态">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.USER_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              v-permission="['system:user:create']"
              type="primary"
              @click="handleCreate"
            >
              <Icon class="mr-5px text-inherit" icon="ep:plus" /> 新增
            </el-button>
            <el-button class="text-gray-600 dark:text-gray-300" @click="handleQuery">
              <Icon class="mr-5px text-inherit" icon="ep:search" /> 搜索
            </el-button>
            <el-button class="text-gray-600 dark:text-gray-300" @click="resetQuery">
              <Icon class="mr-5px text-inherit" icon="ep:refresh" /> 重置
            </el-button>
            <el-button
              v-permission="['system:user:delete']"
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
          <el-table-column align="center" label="用户编号" prop="id" width="90" />
          <el-table-column align="center" label="用户名" prop="username" min-width="100" />
          <el-table-column align="center" label="昵称" prop="nickname" min-width="100" />
          <el-table-column align="center" label="部门" prop="deptName" min-width="100" />
          <el-table-column align="center" label="手机号" prop="mobile" min-width="120" />
          <el-table-column align="center" label="状态" prop="status" width="90">
            <template #default="scope">
              <DictTag :type="DICT_TYPE.USER_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="创建时间"
            prop="createTime"
            width="180"
            :formatter="(row: unknown, _col: unknown, val: string) => dateFormatter(row, _col, val)"
          />
          <el-table-column :width="160" align="center" label="操作" fixed="right">
            <template #default="scope">
              <el-button
                v-permission="['system:user:update']"
                link
                type="primary"
                @click="handleEdit(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="['system:user:delete']"
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
    <UserForm ref="formRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { dateFormatter } from '@/utils/formatTime';
import * as UserApi from '@/api/system/user';
import DictTag from '@/components/DictTag/index.vue';
import UserForm from './UserForm.vue';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemUser' });

const message = useMessage();
const { t } = useI18n();

const loading = ref(true);
const total = ref(0);
const list = ref<UserApi.UserVO[]>([]);
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: '',
  nickname: '',
  status: undefined as number | undefined,
});
const queryFormRef = ref();
const formRef = ref<InstanceType<typeof UserForm>>();

const handleCreate = () => {
  formRef.value?.open('create');
};

const handleEdit = (id: number) => {
  formRef.value?.open('update', id);
};

const getList = async () => {
  loading.value = true;
  try {
    const data = await UserApi.getUserPage(queryParams);
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

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm();
    await UserApi.deleteUser(id);
    message.success(t('common.delSuccess'));
    await getList();
  } catch {
    // 用户取消
  }
};

const checkedIds = ref<number[]>([]);
const handleRowCheckboxChange = (rows: UserApi.UserVO[]) => {
  checkedIds.value = rows.map((r) => r.id);
};

const handleDeleteBatch = async () => {
  try {
    await message.delConfirm();
    for (const id of checkedIds.value) {
      await UserApi.deleteUser(id);
    }
    checkedIds.value = [];
    message.success(t('common.delSuccess'));
    await getList();
  } catch {
    // 用户取消
  }
};

onMounted(() => {
  getList();
});
</script>
