<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="字典名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入字典名称" />
      </el-form-item>
      <el-form-item label="字典类型" prop="type">
        <el-input
          v-model="formData.type"
          :disabled="typeof formData.id !== 'undefined'"
          placeholder="请输入参数名称"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入内容" type="textarea" />
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
import * as DictTypeApi from '@/api/system/dict/dict.type';
import { CommonStatusEnum } from '@/utils/constants';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemDictTypeForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const formData = ref({
  id: undefined as number | undefined,
  name: '',
  type: '',
  status: CommonStatusEnum.ENABLE,
  remark: '',
});
const formRules = reactive({
  name: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
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
      formData.value = { ...(await DictTypeApi.getDictType(id)) };
    } finally {
      formLoading.value = false;
    }
  }
};
defineExpose({ open });

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
    const data = formData.value as DictTypeApi.DictTypeVO;
    if (formType.value === 'create') {
      await DictTypeApi.createDictType(data);
      message.success(t('common.createSuccess'));
    } else {
      await DictTypeApi.updateDictType(data);
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
    type: '',
    name: '',
    status: CommonStatusEnum.ENABLE,
    remark: '',
  };
  formRef.value?.resetFields();
};
</script>
