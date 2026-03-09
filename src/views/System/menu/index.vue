<template>
  <div class="page-root w-full h-full overflow-auto bg-white dark:bg-gray-900">
    <div class="p-6 w-full">
      <!-- 搜索栏 -->
      <el-form
        ref="queryFormRef"
        :inline="true"
        :model="queryParams"
        class="-mb-15px"
        label-width="68px"
      >
        <el-form-item label="菜单名称" prop="name">
          <el-input
            v-model="queryParams.name"
            class="!w-240px"
            clearable
            placeholder="请输入菜单名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            class="!w-240px"
            clearable
            placeholder="请选择菜单状态"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="text-gray-600 dark:text-gray-300" @click="handleQuery">
            <Icon class="mr-5px text-inherit" icon="ep:search" />
            搜索
          </el-button>
          <el-button class="text-gray-600 dark:text-gray-300" @click="resetQuery">
            <Icon class="mr-5px text-inherit" icon="ep:refresh" />
            重置
          </el-button>
          <el-button
            v-permission="['system:menu:create']"
            plain
            type="primary"
            @click="openForm('create')"
          >
            <Icon class="mr-5px text-inherit" icon="ep:plus" />
            新增
          </el-button>
          <el-button plain type="danger" @click="toggleExpandAll">
            <Icon class="mr-5px text-inherit" icon="ep:sort" />
            展开/折叠
          </el-button>
          <el-button class="text-gray-600 dark:text-gray-300" plain @click="refreshMenu">
            <Icon class="mr-5px text-inherit" icon="ep:refresh" />
            刷新菜单缓存
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 列表 -->
      <div class="w-full overflow-x-auto">
        <el-auto-resizer>
          <template #default="{ width }">
            <el-table-v2
              v-model:expanded-row-keys="expandedRowKeys"
              :columns="columns"
              :data="list"
              :expand-column-key="columns[0]!.key"
              :height="600"
              :width="Math.max(width, 800)"
              fixed
              row-key="id"
            />
          </template>
        </el-auto-resizer>
      </div>
    </div>

    <MenuForm ref="formRef" @success="onMenuFormSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { h } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict';
import { handleTree } from '@/utils/tree';
import { getMenuList, deleteMenu, updateMenu, type MenuVO } from '@/api';
import MenuForm from './MenuForm.vue';
import { ElButton, ElSwitch, ElTag, TableV2FixedDir } from 'element-plus';
import { useAppStore } from '@/store/modules/app';
import { useUserStore } from '@/store/modules/user';
import { CommonStatusEnum, SystemMenuTypeEnum } from '@/utils/constants';

defineOptions({ name: 'SystemMenu' });

const MENU_TYPE_LABELS: Record<number, { label: string; tagType: 'primary' | 'success' | 'info' }> = {
  [SystemMenuTypeEnum.DIR]: { label: '目录', tagType: 'primary' },
  [SystemMenuTypeEnum.MENU]: { label: '菜单', tagType: 'success' },
  [SystemMenuTypeEnum.BUTTON]: { label: '按钮', tagType: 'info' },
};

/** 递归按 目录→菜单→按钮 排序，同级内再按 sort */
function sortMenuTree(nodes: MenuVO[]): MenuVO[] {
  if (!nodes?.length) return nodes;
  const sorted = [...nodes].sort((a, b) => {
    const t = (a.type ?? 0) - (b.type ?? 0);
    if (t !== 0) return t;
    return (a.sort ?? 0) - (b.sort ?? 0);
  });
  return sorted.map((n) => ({
    ...n,
    children: n.children?.length ? sortMenuTree(n.children) : undefined,
  }));
}

const userStore = useUserStore();
const { t } = useI18n();

const columns = [
  {
    key: 'type',
    title: '类型',
    dataKey: 'type',
    width: 90,
    fixed: TableV2FixedDir.LEFT,
    cellRenderer: ({ cellData: type }: { cellData?: number }) => {
      const cfg = MENU_TYPE_LABELS[type ?? 0] ?? { label: '-', tagType: 'info' as const };
      return h(ElTag, { type: cfg.tagType, size: 'small' }, () => cfg.label);
    },
  },
  {
    key: 'name',
    title: '菜单名称',
    dataKey: 'name',
    width: 220,
    fixed: TableV2FixedDir.LEFT,
  },
  {
    key: 'icon',
    title: '图标',
    dataKey: 'icon',
    width: 100,
    align: 'center',
    cellRenderer: ({ cellData: icon }: { cellData?: string }) =>
      icon ? h(Icon, { icon, class: 'text-gray-600 dark:text-gray-300' }) : null,
  },
  { key: 'sort', title: '排序', dataKey: 'sort', width: 60 },
  { key: 'permission', title: '权限标识', dataKey: 'permission', width: 300 },
  { key: 'component', title: '组件路径', dataKey: 'component', width: 500 },
  { key: 'componentName', title: '组件名称', dataKey: 'componentName', width: 200 },
  {
    key: 'status',
    title: '状态',
    dataKey: 'status',
    width: 80,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }: { rowData: MenuVO }) => {
      if (!userStore.hasPermission('system:menu:update')) {
        const label = getDictLabel(DICT_TYPE.COMMON_STATUS, rowData.status);
        const type = rowData.status === CommonStatusEnum.ENABLE ? 'success' : 'danger';
        return h(ElTag, { type }, label);
      }
      return h(ElSwitch, {
        modelValue: rowData.status,
        'active-value': CommonStatusEnum.ENABLE,
        'inactive-value': CommonStatusEnum.DISABLE,
        loading: menuStatusUpdating.value[rowData.id],
        class: 'ml-4px',
        'onUpdate:modelValue': (val: number | string | boolean) =>
          handleStatusChanged(rowData, Number(val)),
      });
    },
  },
  {
    key: 'operations',
    title: '操作',
    align: 'center',
    width: 160,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }: { rowData: MenuVO }) => {
      const buttons: ReturnType<typeof h>[] = [];
      if (userStore.hasPermission('system:menu:update')) {
        buttons.push(
          h(
            ElButton,
            { link: true, type: 'primary', onClick: () => openForm('update', rowData.id) },
            () => '修改'
          )
        );
      }
      if (userStore.hasPermission('system:menu:create')) {
        buttons.push(
          h(
            ElButton,
            {
              link: true,
              type: 'primary',
              onClick: () => openForm('create', undefined, rowData.id),
            },
            () => '新增'
          )
        );
      }
      if (userStore.hasPermission('system:menu:delete')) {
        buttons.push(
          h(ElButton, {
            link: true,
            type: 'danger',
            onClick: () => handleDelete(rowData.id),
          }, () => '删除')
        );
      }
      if (buttons.length === 0) return null;
      return h('span', { class: 'inline-flex gap-1' }, buttons);
    },
  },
];

const loading = ref(true);
const list = ref<MenuVO[]>([]);
const queryParams = reactive<{ name?: string; status?: number }>({
  name: undefined,
  status: undefined,
});
const queryFormRef = ref();
const isExpandAll = ref(false);
const expandedRowKeys = ref<number[]>([]);
const menuStatusUpdating = ref<Record<number, boolean>>({});

const getList = async () => {
  loading.value = true;
  try {
    const data = await getMenuList(queryParams);
    list.value = sortMenuTree(handleTree(Array.isArray(data) ? data : [], 'id', 'parentId', 'children'));
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => getList();

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const appStore = useAppStore();
const formRef = ref<InstanceType<typeof MenuForm>>();
const openForm = (type: string, id?: number, parentId?: number) => {
  formRef.value?.open(type, id, parentId);
};

const toggleExpandAll = () => {
  if (isExpandAll.value) {
    expandedRowKeys.value = [];
  } else {
    expandedRowKeys.value = list.value.map((item) => item.id);
  }
  isExpandAll.value = !isExpandAll.value;
};

const refreshMenu = () => {
  appStore.invalidateMenuCache();
  getList();
  ElMessage.success('菜单缓存已刷新');
};

const onMenuFormSuccess = () => {
  getList();
  appStore.invalidateMenuCache();
};

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm(t('common.confirm') + '删除该菜单？', '删除确认', {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
    });
    await deleteMenu(id);
    ElMessage.success(t('common.delSuccess'));
    await getList();
    appStore.invalidateMenuCache();
  } catch {
    // 用户取消或请求失败
  }
};

const handleStatusChanged = async (menu: MenuVO, val: number) => {
  menuStatusUpdating.value[menu.id] = true;
  try {
    await updateMenu({ ...menu, status: val });
    await getList();
    appStore.invalidateMenuCache();
  } finally {
    menuStatusUpdating.value[menu.id] = false;
  }
};

onMounted(() => {
  getList();
});
</script>
