<template>
  <el-dialog v-model="dialogVisible" title="菜单权限" append-to-body>
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="角色名称">
        <el-tag>{{ formData.name }}</el-tag>
      </el-form-item>
      <el-form-item label="角色标识">
        <el-tag>{{ formData.code }}</el-tag>
      </el-form-item>
      <el-form-item label="菜单权限">
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
              v-model="menuExpand"
              active-text="展开"
              inactive-text="折叠"
              inline-prompt
              @change="handleCheckedTreeExpand"
            />
          </template>
          <el-tree
            ref="treeRef"
            :data="menuOptions"
            :props="{ label: 'name', children: 'children' }"
            empty-text="加载中，请稍候"
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
import { handleTree } from '@/utils/tree';
import * as RoleApi from '@/api/system/role';
import * as MenuApi from '@/api/system/menu';
import * as PermissionApi from '@/api/system/permission';
import { useMessage } from '@/hooks/useMessage';

defineOptions({ name: 'SystemRoleAssignMenuForm' });

const { t } = useI18n();
const message = useMessage();

const dialogVisible = ref(false);
const formLoading = ref(false);
const formData = reactive<{ id?: number; name: string; code: string; menuIds: number[] }>({
  id: undefined,
  name: '',
  code: '',
  menuIds: [],
});
const formRef = ref();
const menuOptions = ref<{ id: number; name: string; children?: unknown[] }[]>([]);
const menuExpand = ref(false);
const treeRef = ref();
const treeNodeAll = ref(false);

const open = async (row: RoleApi.RoleVO) => {
  dialogVisible.value = true;
  resetForm();
  const menuList = await MenuApi.getSimpleMenusList();
  menuOptions.value = handleTree(Array.isArray(menuList) ? menuList : [], 'id', 'parentId', 'children');
  formData.id = row.id;
  formData.name = row.name;
  formData.code = row.code;
  formLoading.value = true;
  try {
    formData.menuIds = await PermissionApi.getRoleMenuList(row.id);
    await nextTick();
    formData.menuIds.forEach((menuId) => {
      treeRef.value?.setChecked(menuId, true, false);
    });
  } finally {
    formLoading.value = false;
  }
};
defineExpose({ open });

const emit = defineEmits<{ (e: 'success'): void }>();
const submitForm = async () => {
  formLoading.value = true;
  try {
    const checked = (treeRef.value?.getCheckedKeys(false) ?? []) as number[];
    const halfChecked = (treeRef.value?.getHalfCheckedKeys?.() ?? []) as number[];
    await PermissionApi.assignRoleMenu({
      roleId: formData.id!,
      menuIds: [...checked, ...halfChecked],
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
  menuExpand.value = false;
  formData.id = undefined;
  formData.name = '';
  formData.code = '';
  formData.menuIds = [];
  treeRef.value?.setCheckedNodes([]);
  formRef.value?.resetFields();
};

const handleCheckedTreeNodeAll = () => {
  if (treeNodeAll.value) {
    treeRef.value?.setCheckedNodes(menuOptions.value ?? []);
  } else {
    treeRef.value?.setCheckedNodes([]);
  }
};

const handleCheckedTreeExpand = () => {
  const nodes = treeRef.value?.store?.nodesMap;
  if (!nodes) return;
  for (const key of Object.keys(nodes)) {
    const node = nodes[key];
    if (node && node.expanded !== menuExpand.value) {
      node.expanded = menuExpand.value;
    }
  }
};
</script>
