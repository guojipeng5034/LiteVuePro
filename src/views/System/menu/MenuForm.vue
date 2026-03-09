<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="520px"
    destroy-on-close
    @closed="formRef?.resetFields()"
  >
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      @submit.prevent="submitForm"
    >
      <el-form-item label="上级菜单">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :default-expanded-keys="[0]"
          :props="{ ...defaultProps, disabled: (data: { id?: number; type?: number }) => formData.value.type === SystemMenuTypeEnum.BUTTON && (data?.id === 0 || data?.type === SystemMenuTypeEnum.DIR) }"
          check-strictly
          node-key="id"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="formData.name" clearable placeholder="请输入菜单名称" />
      </el-form-item>
      <el-form-item label="菜单类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)"
            :key="String(dict.value)"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="菜单图标">
        <IconSelect v-model="formData.icon" clearable />
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="路由地址" prop="path">
        <template #label>
          <span>
            路由地址
            <el-tooltip content="访问的路由地址，如：user。外网地址以 http(s):// 开头" placement="top">
              <Icon icon="ep:question-filled" class="text-gray-500 dark:text-gray-400" />
            </el-tooltip>
          </span>
        </template>
        <el-input v-model="formData.path" clearable placeholder="请输入路由地址" />
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="组件地址" prop="component">
        <el-input v-model="formData.component" clearable placeholder="例如：system/user/index" />
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="组件名字" prop="componentName">
        <el-input v-model="formData.componentName" clearable placeholder="例如：SystemUser" />
      </el-form-item>
      <el-form-item v-if="formData.type !== 1" label="权限标识" prop="permission">
        <template #label>
          <span>
            权限标识
            <el-tooltip content="如：system:user:list" placement="top">
              <Icon icon="ep:question-filled" class="text-gray-500 dark:text-gray-400" />
            </el-tooltip>
          </span>
        </template>
        <el-input v-model="formData.permission" clearable placeholder="请输入权限标识" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" controls-position="right" class="w-full" />
      </el-form-item>
      <el-form-item label="菜单状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="String(dict.value)"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="显示状态" prop="visible">
        <template #label>
          <span>
            显示状态
            <el-tooltip content="隐藏时路由不出现在侧栏，但仍可访问" placement="top">
              <Icon icon="ep:question-filled" class="text-gray-500 dark:text-gray-400" />
            </el-tooltip>
          </span>
        </template>
        <el-radio-group v-model="formData.visible">
          <el-radio :value="true" border>显示</el-radio>
          <el-radio :value="false" border>隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="总是显示" prop="alwaysShow">
        <template #label>
          <span>
            总是显示
            <el-tooltip content="选“否”时，仅一个子菜单则直接展示子菜单" placement="top">
              <Icon icon="ep:question-filled" class="text-gray-500 dark:text-gray-400" />
            </el-tooltip>
          </span>
        </template>
        <el-radio-group v-model="formData.alwaysShow">
          <el-radio :value="true" border>总是</el-radio>
          <el-radio :value="false" border>否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="缓存状态" prop="keepAlive">
        <template #label>
          <span>
            缓存状态
            <el-tooltip content="缓存时会被 keep-alive 缓存，需填写组件名称" placement="top">
              <Icon icon="ep:question-filled" class="text-gray-500 dark:text-gray-400" />
            </el-tooltip>
          </span>
        </template>
        <el-radio-group v-model="formData.keepAlive">
          <el-radio :value="true" border>缓存</el-radio>
          <el-radio :value="false" border>不缓存</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" native-type="button" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import {
  getMenu,
  getSimpleMenusList,
  createMenu,
  updateMenu,
  type MenuVO,
} from '@/api';
import { CommonStatusEnum, SystemMenuTypeEnum } from '@/utils/constants';
import { defaultProps, handleTree } from '@/utils/tree';

defineOptions({ name: 'SystemMenuForm' });

interface Tree {
  id: number;
  name: string;
  type?: number;
  children?: Tree[];
}

const { t } = useI18n();

const dialogVisible = ref(false);
const dialogTitle = ref('');
const formLoading = ref(false);
const formType = ref('');
const formData = ref({
  id: undefined as number | undefined,
  name: '',
  permission: '',
  type: SystemMenuTypeEnum.DIR,
  sort: 0,
  parentId: 0,
  path: '',
  icon: '',
  component: '',
  componentName: '',
  status: CommonStatusEnum.ENABLE,
  visible: true,
  keepAlive: true,
  alwaysShow: true,
});
const formRules = reactive({
  name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '菜单类型不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
});
const formRef = ref();

const menuTree = ref<Tree[]>([]);

const open = async (type: string, id?: number, parentId?: number) => {
  dialogVisible.value = true;
  dialogTitle.value = type === 'create' ? t('action.create') : t('action.update');
  formType.value = type;
  resetForm();
  if (parentId != null) {
    formData.value.parentId = parentId;
  }
  if (id != null) {
    formLoading.value = true;
    try {
      const data = await getMenu(id);
      formData.value = { ...formData.value, ...data };
    } finally {
      formLoading.value = false;
    }
  }
  const res = await getSimpleMenusList();
  const arr = Array.isArray(res) ? res : [];
  const root: Tree = { id: 0, name: '主类目', children: handleTree(arr, 'id', 'parentId', 'children') };
  menuTree.value = [root];
};

defineExpose({ open });

const emit = defineEmits<(e: 'success') => void>();

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
  if (
    (formData.value.type === SystemMenuTypeEnum.DIR || formData.value.type === SystemMenuTypeEnum.MENU) &&
    !isExternal(formData.value.path)
  ) {
    if (formData.value.parentId === 0 && formData.value.path.charAt(0) !== '/') {
      ElMessage.error('路径必须以 / 开头');
      formLoading.value = false;
      return;
    }
    if (formData.value.parentId !== 0 && formData.value.path.charAt(0) === '/') {
      ElMessage.error('路径不能以 / 开头');
      formLoading.value = false;
      return;
    }
  }
  try {
    const data = formData.value as unknown as MenuVO;
    if (formType.value === 'create') {
      await createMenu(data);
      ElMessage.success(t('common.createSuccess'));
    } else {
      await updateMenu(data);
      ElMessage.success(t('common.updateSuccess'));
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
    name: '',
    permission: '',
    type: SystemMenuTypeEnum.DIR,
    sort: 0,
    parentId: 0,
    path: '',
    icon: '',
    component: '',
    componentName: '',
    status: CommonStatusEnum.ENABLE,
    visible: true,
    keepAlive: true,
    alwaysShow: true,
  };
  formRef.value?.resetFields();
};

const isExternal = (path: string) => /^(https?:|mailto:|tel:)/.test(path);
</script>
