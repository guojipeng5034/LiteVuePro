<template>
  <el-dialog v-model="dialogVisible" title="IP 查询" append-to-body>
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="IP" prop="ip">
        <el-input v-model="formData.ip" placeholder="请输入 IP 地址" />
      </el-form-item>
      <el-form-item label="地址" prop="result">
        <el-input v-model="formData.result" placeholder="展示查询 IP 结果" readonly />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import * as AreaApi from '@/api/system/area';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemAreaForm' });

const message = useMessage();
const dialogVisible = ref(false);
const formLoading = ref(false);
const formData = ref<{ ip: string; result?: string }>({
  ip: '',
  result: undefined,
});
const formRules = reactive({
  ip: [{ required: true, message: 'IP 地址不能为空', trigger: 'blur' }],
});
const formRef = ref();

const open = async () => {
  dialogVisible.value = true;
  resetForm();
};
defineExpose({ open });

const submitForm = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  formLoading.value = true;
  try {
    formData.value.result = await AreaApi.getAreaByIp(formData.value.ip.trim());
    message.success('查询成功');
  } finally {
    formLoading.value = false;
  }
};

const resetForm = () => {
  formData.value = { ip: '', result: undefined };
  formRef.value?.resetFields();
};
</script>
