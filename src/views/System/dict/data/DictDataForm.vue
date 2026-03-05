<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="字典类型" prop="dictType">
        <el-input
          v-model="formData.dictType"
          :disabled="typeof formData.id !== 'undefined'"
          placeholder="请输入参数名称"
        />
      </el-form-item>
      <el-form-item label="数据标签" prop="label">
        <el-input v-model="formData.label" placeholder="请输入数据标签" />
      </el-form-item>
      <el-form-item label="数据键值" prop="value">
        <el-input v-model="formData.value" placeholder="请输入数据键值" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" />
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
      <el-form-item label="颜色类型" prop="colorType">
        <el-select v-model="formData.colorType" clearable placeholder="请选择">
          <el-option
            v-for="item in colorTypeOptions"
            :key="item.value"
            :label="item.label + '(' + item.value + ')'"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="CSS Class" prop="cssClass">
        <el-input v-model="formData.cssClass" placeholder="请输入 CSS Class" />
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
import * as DictDataApi from '@/api/system/dict/dict.data';
import { CommonStatusEnum } from '@/utils/constants';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemDictDataForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const formData = ref({
  id: undefined as number | undefined,
  sort: undefined as number | undefined,
  label: '',
  value: '',
  dictType: '',
  status: CommonStatusEnum.ENABLE,
  colorType: '',
  cssClass: '',
  remark: '',
});
const formRules = reactive({
  label: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
  value: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
});
const formRef = ref();

const colorTypeOptions = readonly([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
]);

const open = async (type: string, id?: number, dictType?: string) => {
  dialogVisible.value = true;
  dialogTitle.value = t('action.' + type);
  formType.value = type;
  resetForm();
  if (dictType) formData.value.dictType = dictType;
  if (id) {
    formLoading.value = true;
    try {
      formData.value = { ...(await DictDataApi.getDictData(id)) };
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
    const data = formData.value as DictDataApi.DictDataVO;
    if (formType.value === 'create') {
      await DictDataApi.createDictData(data);
      message.success(t('common.createSuccess'));
    } else {
      await DictDataApi.updateDictData(data);
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
    sort: undefined,
    label: '',
    value: '',
    dictType: '',
    status: CommonStatusEnum.ENABLE,
    colorType: '',
    cssClass: '',
    remark: '',
  };
  formRef.value?.resetFields();
};
</script>
