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
      <el-form-item v-if="formType === 'create'" label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item v-if="formType === 'create'" label="密码" prop="password">
        <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="所属部门" prop="deptId">
        <el-tree-select
          v-model="formData.deptId"
          :data="deptTree"
          :props="{ label: 'name' }"
          check-strictly
          clearable
          default-expand-all
          node-key="id"
          placeholder="请选择部门"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="formData.mobile" maxlength="20" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" clearable placeholder="请选择状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.USER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="角色" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          multiple
          clearable
          placeholder="请选择角色"
          style="width: 100%"
        >
          <el-option
            v-for="r in roleList"
            :key="r.id"
            :label="r.name"
            :value="r.id"
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { handleTree } from '@/utils/tree';
import * as DeptApi from '@/api/system/dept';
import * as RoleApi from '@/api/system/role';
import * as UserApi from '@/api/system/user';
import { UserStatusEnum } from '@/utils/constants';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemUserForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const deptTree = ref<DeptApi.DeptVO[]>([]);
const roleList = ref<RoleApi.RoleVO[]>([]);
const formData = ref<UserApi.UserSaveDTO>({
  id: undefined,
  username: '',
  password: '',
  nickname: '',
  deptId: undefined,
  mobile: '',
  status: UserStatusEnum.ENABLE,
  roleIds: [],
});
const formRules = reactive({
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [
    {
      required: true,
      validator: (_: unknown, value: string, cb: (e?: Error) => void) => {
        if (formType.value === 'create' && !value) cb(new Error('密码不能为空'));
        else cb();
      },
      trigger: 'blur',
    },
  ],
  nickname: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
});
const formRef = ref();

const loadDeptTree = async () => {
  const list = await DeptApi.getSimpleDeptList();
  deptTree.value = handleTree(list, 'id', 'parentId') as DeptApi.DeptVO[];
};

const loadRoleList = async () => {
  const { list } = await RoleApi.getRolePage({ pageNo: 1, pageSize: 200 });
  roleList.value = list ?? [];
};

const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  await Promise.all([loadDeptTree(), loadRoleList()]);
  resetForm();
  if (id) {
    formLoading.value = true;
    try {
      const data = await UserApi.getUser(id);
      formData.value = {
        id: data.id,
        nickname: data.nickname ?? '',
        deptId: data.deptId,
        mobile: data.mobile ?? '',
        status: data.status ?? UserStatusEnum.ENABLE,
        roleIds: data.roleIds ?? [],
      };
    } finally {
      formLoading.value = false;
    }
  }
};
defineExpose({ open });

const resetForm = () => {
  formData.value = {
    id: undefined,
    username: '',
    password: '',
    nickname: '',
    deptId: undefined,
    mobile: '',
    status: UserStatusEnum.ENABLE,
    roleIds: [],
  };
  formRef.value?.resetFields();
};

const emit = defineEmits(['success']);
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
    const data = { ...formData.value };
    if (formType.value === 'create') {
      if (!data.username?.trim()) {
        message.error('用户名不能为空');
        return;
      }
      if (!data.password) {
        message.error('密码不能为空');
        return;
      }
      await UserApi.createUser(data);
      message.success(t('common.createSuccess'));
    } else {
      if (!data.id) return;
      await UserApi.updateUser(data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};
</script>
