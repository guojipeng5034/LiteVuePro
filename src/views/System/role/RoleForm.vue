<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色标识" prop="code">
        <el-input v-model="formData.code" placeholder="请输入角色标识" />
      </el-form-item>
      <el-form-item label="显示顺序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
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
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输备注" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import { CommonStatusEnum } from '@/utils/constants';
import * as RoleApi from '@/api/system/role';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemRoleForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const formData = ref({
  id: undefined as number | undefined,
  name: '',
  code: '',
  sort: undefined as number | undefined,
  status: CommonStatusEnum.ENABLE,
  remark: '',
});
const formRules = reactive({
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '角色标识不能为空', trigger: 'change' }],
  sort: [{ required: true, message: '显示顺序不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
  remark: [{ required: false, message: '备注不能为空', trigger: 'blur' }],
});
const formRef = ref();

const open = async (type: string, id?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();
  if (id) {
    formLoading.value = true;
    try {
      formData.value = { ...(await RoleApi.getRole(id)) };
    } finally {
      formLoading.value = false;
    }
  }
};
defineExpose({ open });

const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    code: '',
    sort: undefined,
    status: CommonStatusEnum.ENABLE,
    remark: '',
  };
  formRef.value?.resetFields();
};

const emit = defineEmits<{ (e: 'success'): void }>();
const submitForm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  formLoading.value = true;
  try {
    const data = formData.value as unknown as RoleApi.RoleVO;
    if (formType.value === 'create') {
      await RoleApi.createRole(data);
      message.success(t('common.createSuccess'));
    } else {
      await RoleApi.updateRole(data);
      message.success(t('common.updateSuccess'));
    }
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};
</script>
