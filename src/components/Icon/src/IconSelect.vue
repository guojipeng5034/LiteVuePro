<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { IconJson } from '@/components/Icon/src/data'

defineOptions({ name: 'IconSelect' })

/** 深拷贝图标数据，用于前端搜索（不修改原数据） */
const copyIconList = ref<Record<string, string[]>>(
  structuredClone(IconJson)
)

type ParameterCSSProperties = (item?: string) => CSSProperties | undefined

const props = defineProps({
  modelValue: {
    require: false,
    type: String
  },
  clearable: {
    require: false,
    type: Boolean
  }
})
const emit = defineEmits<{ (e: 'update:modelValue', v: string) }>()

const visible = ref(false)
const inputValue = toRef(props, 'modelValue')
const iconList = IconJson
const icon = ref('add-location')
const currentActiveType = ref('ep:')

const pageSize = ref(96)
const currentPage = ref(1)

// 搜索条件
const filterValue = ref('')

const tabsList = [
  {
    label: 'Element Plus',
    name: 'ep:'
  },
  {
    label: 'Font Awesome 4',
    name: 'fa:'
  },
  {
    label: 'Font Awesome 5 Solid',
    name: 'fa-solid:'
  }
]

const pageList = computed(() => {
  const list = copyIconList.value[currentActiveType.value]?.filter((v) => v.includes(filterValue.value)) ?? []
  if (currentPage.value === 1) {
    return list.slice(0, pageSize.value)
  }
  return list.slice(
    pageSize.value * (currentPage.value - 1),
    pageSize.value * (currentPage.value - 1) + pageSize.value
  )
})
const iconCount = computed(() => {
  const list = copyIconList.value[currentActiveType.value]
  return list == null ? 0 : list.length
})

const iconItemStyle = computed((): ParameterCSSProperties => {
  return (item) => {
    if (inputValue.value === currentActiveType.value + item) {
      return {
        borderColor: 'var(--el-color-primary)',
        color: 'var(--el-color-primary)'
      }
    }
  }
})

function handleClick(pane: { props?: { name: string } } | string) {
  currentPage.value = 1
  const name = typeof pane === 'object' && pane?.props?.name != null ? pane.props.name : String(pane)
  currentActiveType.value = name
  const list = copyIconList.value[name]
  const first = list?.[0]
  if (first) {
    emit('update:modelValue', name + first)
    icon.value = first
  }
}

function onChangeIcon(item) {
  icon.value = item
  emit('update:modelValue', currentActiveType.value + item)
  visible.value = false
}

function onCurrentChange(page) {
  currentPage.value = page
}

function clearIcon() {
  icon.value = ''
  emit('update:modelValue', '')
  visible.value = false
}

watch(
  () => {
    return props.modelValue
  },
  () => {
    if (props.modelValue?.includes(':')) {
      currentActiveType.value = props.modelValue.substring(0, props.modelValue.indexOf(':') + 1)
      icon.value = props.modelValue.substring(props.modelValue.indexOf(':') + 1)
    }
  }
)
watch(
  () => {
    return filterValue.value
  },
  () => {
    currentPage.value = 1
  }
)
</script>

<template>
  <div class="selector">
    <ElInput v-model="inputValue" @click="visible = !visible" :clearable="props.clearable" @clear="clearIcon">
      <template #append>
        <ElPopover
          :popper-options="{
            placement: 'auto'
          }"
          :visible="visible"
          :width="355"
          popper-class="pure-popper"
          trigger="click"
        >
          <template #reference>
            <div
              class="h-32px w-40px flex cursor-pointer items-center justify-center"
              @click="visible = !visible"
            >
              <Icon :icon="currentActiveType + icon" />
            </div>
          </template>

          <ElInput v-model="filterValue" class="p-2" clearable placeholder="搜索图标" />
          <ElDivider border-style="dashed" />

          <ElTabs v-model="currentActiveType" @tab-click="handleClick">
            <ElTabPane
              v-for="(pane, index) in tabsList"
              :key="index"
              :label="pane.label"
              :name="pane.name"
            >
              <ElDivider border-style="dashed" class="tab-divider" />
              <ElScrollbar height="220px">
                <ul class="ml-2 flex flex-wrap">
                  <li
                    v-for="(item, key) in pageList"
                    :key="key"
                    :style="iconItemStyle(item)"
                    :title="item"
                    class="icon-item mr-2 mt-1 w-1/10 flex cursor-pointer items-center justify-center border border-solid p-2"
                    @click="onChangeIcon(item)"
                  >
                    <Icon :icon="currentActiveType + item" />
                  </li>
                </ul>
              </ElScrollbar>
            </ElTabPane>
          </ElTabs>
          <ElDivider border-style="dashed" />

          <ElPagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="iconCount"
            background
            class="h-10 flex items-center justify-center"
            layout="prev, pager, next"
            size="small"
            @current-change="onCurrentChange"
          />
        </ElPopover>
      </template>
    </ElInput>
  </div>
</template>

<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 1px auto !important;
}

.tab-divider.el-divider--horizontal {
  margin: 0 !important;
}

.icon-item {
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    transform: scaleX(1.05);
    transition: all 0.4s;
  }
}

:deep(.el-tabs__nav-next) {
  font-size: 15px;
  line-height: 32px;
  box-shadow: -5px 0 5px -6px #ccc;
}

:deep(.el-tabs__nav-prev) {
  font-size: 15px;
  line-height: 32px;
  box-shadow: 5px 0 5px -6px #ccc;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-tabs__item) {
  height: 30px;
  font-size: 12px;
  font-weight: normal;
  line-height: 30px;
}

:deep(.el-tabs__header),
:deep(.el-tabs__nav-wrap) {
  position: static;
  margin: 0;
}
</style>
