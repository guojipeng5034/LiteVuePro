<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      @submit.prevent="submitForm"
    >
      <el-form-item label="上级部门" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="deptTree"
          :props="{ label: 'name', value: 'id' }"
          check-strictly
          default-expand-all
          placeholder="请选择上级部门"
          value-key="id"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
      </el-form-item>
      <el-form-item label="负责人" prop="leaderUserId">
        <el-select v-model="formData.leaderUserId" clearable placeholder="请选择负责人">
          <el-option
            v-for="item in userList"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" maxlength="11" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" maxlength="50" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" native-type="button" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { FormRules } from 'element-plus';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { handleTree } from '@/utils/tree';
import * as DeptApi from '@/api/system/dept';
import * as UserApi from '@/api/system/user';
import { CommonStatusEnum } from '@/utils/constants';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemDeptForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const formData = ref({
  id: undefined as number | undefined,
  parentId: undefined as number | undefined,
  name: undefined as string | undefined,
  sort: undefined as number | undefined,
  leaderUserId: undefined as number | undefined,
  phone: undefined as string | undefined,
  email: undefined as string | undefined,
  status: CommonStatusEnum.ENABLE,
});
const formRules = reactive<FormRules>({
  parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
});
const formRef = ref();
const deptTree = ref<{ id: number; name: string; children?: unknown[] }[]>([]);
const userList = ref<UserApi.UserVO[]>([]);

const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();
  if (id) {
    formLoading.value = true;
    try {
      const data = await DeptApi.getDept(id);
      formData.value = { ...data };
    } finally {
      formLoading.value = false;
    }
  }
  userList.value = await UserApi.getSimpleUserList();
  const data = await DeptApi.getSimpleDeptList();
  const children = handleTree(Array.isArray(data) ? data : [], 'id', 'parentId', 'children');
  deptTree.value = [{ id: 0, name: '顶级部门', children }];
};
defineExpose({ open });

const emit = defineEmits<{ (e: 'success'): void }>();
const submitForm = async () => {
  if (!formRef.value) return;
  if (formLoading.value) return;
  formLoading.value = true;
  try {
    await formRef.value.validate();
  } catch {
    formLoading.value = false;
    return;
  }
  try {
    const data = formData.value as unknown as DeptApi.DeptVO;
    if (formType.value === 'create') {
      await DeptApi.createDept(data);
      message.success(t('common.createSuccess'));
    } else {
      await DeptApi.updateDept(data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    id: undefined,
    parentId: undefined,
    name: undefined,
    sort: undefined,
    leaderUserId: undefined,
    phone: undefined,
    email: undefined,
    status: CommonStatusEnum.ENABLE,
  };
  formRef.value?.resetFields();
};
</script>
