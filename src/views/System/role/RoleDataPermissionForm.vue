<template>
  <el-dialog v-model="dialogVisible" title="数据权限" width="800" append-to-body>
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="角色名称">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="角色标识">
        <el-tag>{{ formData.code }}</el-tag>
      </el-form-item>
      <el-form-item label="权限范围">
        <el-select v-model="formData.dataScope">
          <el-option
            v-for="item in getIntDictOptions(DICT_TYPE.SYSTEM_DATA_SCOPE)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM"
        label="部门范围"
        label-width="80px"
      >
        <el-card class="w-full h-400px overflow-y-auto bg-white dark:bg-gray-900" shadow="never">
          <template #header>
            <span class="text-gray-800 dark:text-gray-200">全选/全不选:</span>
            <el-switch
              v-model="treeNodeAll"
              active-text="是"
              inactive-text="否"
              inline-prompt
              @change="handleCheckedTreeNodeAll"
            />
            <span class="ml-4 text-gray-800 dark:text-gray-200">全部展开/折叠:</span>
            <el-switch
              v-model="deptExpand"
              active-text="展开"
              inactive-text="折叠"
              inline-prompt
              @change="handleCheckedTreeExpand"
            />
            <span class="ml-4 text-gray-800 dark:text-gray-200">父子联动:</span>
            <el-switch v-model="checkStrictly" active-text="否" inactive-text="是" inline-prompt />
          </template>
          <el-tree
            ref="treeRef"
            :check-strictly="!checkStrictly"
            :data="deptOptions"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            empty-text="加载中，请稍后"
            node-key="id"
            show-checkbox
          />
        </el-card>
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
import { handleTree } from '@/utils/tree';
import { SystemDataScopeEnum } from '@/utils/constants';
import * as RoleApi from '@/api/system/role';
import * as DeptApi from '@/api/system/dept';
import * as PermissionApi from '@/api/system/permission';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemRoleDataPermissionForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const formLoading = ref(false);
const formData = reactive<{
  id?: number;
  name: string;
  code: string;
  dataScope?: number;
  dataScopeDeptIds: number[];
}>({
  id: undefined,
  name: '',
  code: '',
  dataScope: undefined,
  dataScopeDeptIds: [],
});
const formRef = ref();
const deptOptions = ref<{ id: number; name: string; children?: unknown[] }[]>([]);
const deptExpand = ref(true);
const treeRef = ref();
const treeNodeAll = ref(false);
const checkStrictly = ref(true);

const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true;
  resetForm();
  const deptList = await DeptApi.getSimpleDeptList();
  deptOptions.value = handleTree(Array.isArray(deptList) ? deptList : [], 'id', 'parentId', 'children');
  formData.id = row.id;
  formData.name = row.name;
  formData.code = row.code;
  formData.dataScope = row.dataScope;
  await nextTick();
  (row.dataScopeDeptIds ?? []).forEach((deptId) => {
    treeRef.value?.setChecked(deptId, true, false);
  });
};
defineExpose({ open });

const emit = defineEmits<{ (e: 'success'): void }>();
const submitForm = async () => {
  formLoading.value = true;
  try {
    const dataScopeDeptIds =
      formData.dataScope === SystemDataScopeEnum.DEPT_CUSTOM
        ? (treeRef.value?.getCheckedKeys(false) ?? [])
        : [];
    await PermissionApi.assignRoleDataScope({
      roleId: formData.id!,
      dataScope: formData.dataScope!,
      dataScopeDeptIds,
    });
    message.success(t('common.updateSuccess'));
    dialogVisible.value = false;
    emit('success');
  } finally {
    formLoading.value = false;
  }
};

const resetForm = () => {
  treeNodeAll.value = false;
  deptExpand.value = true;
  checkStrictly.value = true;
  formData.id = undefined;
  formData.name = '';
  formData.code = '';
  formData.dataScope = undefined;
  formData.dataScopeDeptIds = [];
  treeRef.value?.setCheckedNodes([]);
  formRef.value?.resetFields();
};

const handleCheckedTreeNodeAll = () => {
  if (treeNodeAll.value) {
    treeRef.value?.setCheckedNodes(deptOptions.value ?? []);
  } else {
    treeRef.value?.setCheckedNodes([]);
  }
};

const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (!nodes) return;
  for (const key of Object.keys(nodes)) {
    const node = nodes[key];
    if (node && node.expanded !== deptExpand.value) {
      node.expanded = deptExpand.value;
    }
  }
};
</script>
