# TinyMCE 富文本编辑器组件

基于 TinyMCE 8 的 Vue3 富文本编辑器组件，采用自托管方式部署，支持多语言国际化。

## ✨ 功能特性

- ✅ **自托管部署** - 无需依赖外部 CDN，加载速度快
- ✅ **多语言支持** - 自动跟随项目语言（中文、英文）
- ✅ **双向数据绑定** - 支持 v-model
- ✅ **完整的工具栏** - 包含 30+ 官方插件
- ✅ **图片上传** - 支持粘贴和拖拽上传
- ✅ **自动保存** - 防止内容丢失
- ✅ **禁用状态** - 支持只读模式
- ✅ **灵活配置** - 支持自定义工具栏、插件、主题
- ✅ **TypeScript** - 完整的类型支持
- ✅ **响应式** - 支持自定义宽度和高度

## 📦 安装

组件已全局注册，无需额外安装。如需按需引入：

```typescript
import { TinyMCEEditor } from '@/components/TinyMCE'
```

## 🚀 基础用法

### 最简单的使用

```vue
<template>
  <TinyMCEEditor v-model="content" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('<p>初始内容</p>')
</script>
```

### 自定义高度

```vue
<template>
  <TinyMCEEditor v-model="content" :height="600" />
</template>
```

### 禁用编辑器

```vue
<template>
  <TinyMCEEditor v-model="content" :disabled="true" />
</template>
```

## 📋 Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| modelValue | string | '' | 编辑器内容，支持 v-model |
| disabled | boolean | false | 是否禁用编辑器 |
| height | string \| number | 500 | 编辑器高度（px） |
| width | string \| number | '100%' | 编辑器宽度 |
| toolbar | string \| string[] | (见下方) | 工具栏配置 |
| plugins | string \| string[] | (见下方) | 插件配置 |
| menubar | string \| boolean | 'edit insert format table' | 菜单栏配置 |
| zIndex | number | 10000 | 弹出层的 z-index 基础值，用于在 Drawer/Dialog 中正常显示 |
| init | RawEditorOptions | {} | 自定义初始化配置 |

### 默认工具栏配置

```
undo redo | blocks fontsize | bold italic underline strikethrough | 
forecolor backcolor | alignleft aligncenter alignright alignjustify | 
bullist numlist outdent indent | link image table | code fullscreen | removeformat
```

### 默认插件配置

```
advlist autolink lists link image charmap preview anchor searchreplace 
visualblocks code fullscreen insertdatetime table help wordcount
```

### 默认菜单栏

```
edit insert format table
```

简化版菜单栏，包含：
- **Edit（编辑）**：撤销、重做、剪切、复制、粘贴、查找替换
- **Insert（插入）**：插入图片、链接、表格、媒体等
- **Format（格式）**：文本格式、段落格式
- **Table（表格）**：表格操作

## 📤 Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: string) | 内容更新时触发（v-model） |
| change | (value: string, editor: Editor) | 内容变化时触发 |
| init | (editor: Editor) | 编辑器初始化完成时触发 |
| focus | (editor: Editor) | 编辑器获得焦点时触发 |
| blur | (editor: Editor) | 编辑器失去焦点时触发 |

### 事件使用示例

```vue
<template>
  <TinyMCEEditor
    v-model="content"
    @init="handleInit"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import type { Editor } from 'tinymce'

const handleInit = (editor: Editor) => {
  console.log('编辑器初始化完成', editor)
}

const handleChange = (value: string, editor: Editor) => {
  console.log('内容变化', value)
}

const handleFocus = (editor: Editor) => {
  console.log('获得焦点')
}

const handleBlur = (editor: Editor) => {
  console.log('失去焦点')
}
</script>
```

## 🔧 暴露的方法

通过 `ref` 可以访问以下方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getEditor | - | Editor \| null | 获取编辑器实例 |
| getContent | - | string | 获取编辑器内容 |
| setContent | (content: string) | void | 设置编辑器内容 |
| insertContent | (content: string) | void | 在光标位置插入内容 |
| focus | - | void | 聚焦编辑器 |
| destroy | - | void | 销毁编辑器实例 |

### 方法使用示例

```vue
<template>
  <div>
    <TinyMCEEditor ref="editorRef" v-model="content" />
    <el-button @click="getContent">获取内容</el-button>
    <el-button @click="setContent">设置内容</el-button>
    <el-button @click="insertContent">插入内容</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TinyMCEEditor } from '@/components/TinyMCE'

const editorRef = ref()
const content = ref('<p>Hello</p>')

// 获取内容
const getContent = () => {
  const html = editorRef.value?.getContent()
  console.log('当前内容:', html)
}

// 设置内容
const setContent = () => {
  editorRef.value?.setContent('<p>新内容</p>')
}

// 插入内容
const insertContent = () => {
  editorRef.value?.insertContent('<p>插入的内容</p>')
}
</script>
```

## 🎨 高级用法

### 1. 隐藏菜单栏

```vue
<TinyMCEEditor 
  v-model="content"
  :menubar="false"
/>
```

### 2. 简化工具栏

```vue
<TinyMCEEditor 
  v-model="content"
  toolbar="undo redo | bold italic | alignleft aligncenter alignright | bullist numlist"
  plugins="lists"
  :menubar="false"
/>
```

### 3. 自定义高度和宽度

```vue
<TinyMCEEditor 
  v-model="content"
  :height="600"
  :width="800"
/>
```

### 4. 自定义配置

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    placeholder: '请输入内容...',
    min_height: 300,
    max_height: 800,
    resize: true
  }"
/>
```

### 5. 自定义图片上传

默认情况下，图片会被转换为 base64。如需上传到服务器：

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    images_upload_handler: async (blobInfo, progress) => {
      try {
        // 创建 FormData
        const formData = new FormData()
        formData.append('file', blobInfo.blob(), blobInfo.filename())
        
        // 调用你的上传 API
        const response = await axios.post('/api/upload', formData, {
          onUploadProgress: (e) => {
            progress((e.loaded / e.total) * 100)
          }
        })
        
        // 返回图片 URL
        return response.data.url
      } catch (error) {
        console.error('图片上传失败', error)
        throw error
      }
    }
  }"
/>
```

### 6. 在 Drawer/Dialog 中使用

TinyMCE 在 Drawer 或 Dialog 中使用时，组件已自动配置了正确的 z-index，所有弹出层都能正常显示：

```vue
<template>
  <el-drawer v-model="visible" title="编辑内容" size="70%">
    <el-form :model="formData" label-width="120px">
      <el-form-item label="描述">
        <!-- 默认配置已经可以正常工作 -->
        <TinyMCEEditor 
          v-model="formData.description" 
          :height="400" 
        />
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { TinyMCEEditor } from '@/components/TinyMCE'

const visible = ref(false)
const formData = reactive({
  description: ''
})
</script>
```

**注意事项：**
- ✅ 下拉菜单（格式、字号等）可以正常点击
- ✅ 颜色选择器可以正常显示
- ✅ 插入链接/图片对话框正常工作
- ✅ 表格编辑菜单正常显示

如果在特殊场景下仍有层级问题，可以手动调整：

```vue
<TinyMCEEditor 
  v-model="content" 
  :z-index="20000"  
/>
```

### 7. 暗色主题

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    skin_url: '/tinymce/skins/ui/oxide-dark',
    content_css: '/tinymce/skins/content/dark/content.css'
  }"
/>
```

## 🌍 多语言支持

组件会自动跟随项目的语言设置：

| 项目语言 | TinyMCE 界面 | 格式选项 | 颜色名称 |
|----------|--------------|----------|----------|
| zh-CN | 中文 | 段落、标题1-6 | 黑色、白色、红色 |
| en | English | Paragraph, Heading 1-6 | Black, White, Red |
| ko | 한국어 | 단락, 제목 1-6 | 검정색, 흰색, 빨간색 |
| ja | 日本語 | 段落, 見出し1-6 | 黒, 白, 赤 |

### 语言切换

当用户切换项目语言时，刷新页面后 TinyMCE 界面会自动更新。

## 🎯 完整配置示例

### 文章编辑器（推荐配置）

```vue
<TinyMCEEditor
  v-model="content"
  :height="600"
  toolbar="undo redo | blocks fontsize | bold italic underline strikethrough | 
           forecolor backcolor | alignleft aligncenter alignright alignjustify | 
           bullist numlist outdent indent | link image table | 
           code fullscreen preview | removeformat"
  plugins="advlist autolink lists link image charmap preview anchor 
           searchreplace visualblocks code fullscreen insertdatetime 
           table help wordcount"
  menubar="edit insert format table"
/>
```

### 评论编辑器（极简配置）

```vue
<TinyMCEEditor
  v-model="content"
  :height="250"
  toolbar="undo redo | bold italic | bullist numlist"
  plugins="lists"
  :menubar="false"
/>
```

### 富文本编辑器（完整功能）

```vue
<TinyMCEEditor
  v-model="content"
  :height="700"
  menubar="edit view insert format tools table"
  :init="{
    // 自定义占位符
    placeholder: '请输入文章内容...',
    // 自适应高度
    min_height: 400,
    max_height: 1000,
    autoresize_bottom_margin: 50,
    // 自定义图片上传
    images_upload_handler: async (blobInfo) => {
      const formData = new FormData()
      formData.append('file', blobInfo.blob())
      const response = await uploadImage(formData)
      return response.url
    }
  }"
/>
```

## 🔌 可用插件

组件已包含所有官方插件（默认启用常用插件）：

### 内容编辑
- `advlist` - 高级列表
- `autolink` - 自动链接
- `lists` - 列表
- `link` - 链接
- `image` - 图片
- `charmap` - 特殊字符
- `anchor` - 锚点

### 搜索和可视化
- `searchreplace` - 搜索替换
- `visualblocks` - 可视化块
- `visualchars` - 可视化字符
- `code` - 代码视图
- `fullscreen` - 全屏模式
- `preview` - 预览

### 内容插入
- `insertdatetime` - 插入日期时间
- `table` - 表格
- `template` - 模板
- `emoticons` - 表情符号

### 其他
- `help` - 帮助
- `wordcount` - 字数统计
- `autosave` - 自动保存
- `save` - 保存按钮
- `pagebreak` - 分页符
- `nonbreaking` - 不间断空格

## 🎨 工具栏按钮说明

### 文本格式
- **Bold** (`bold`) - 粗体
- **Italic** (`italic`) - 斜体
- **Underline** (`underline`) - 下划线
- **Strikethrough** (`strikethrough`) - 删除线

### 格式选择
- **Blocks** (`blocks`) - 段落格式（段落、标题1-6、预格式化）
- **Font Size** (`fontsize`) - 字体大小（12px-36px）

### 颜色
- **Text Color** (`forecolor`) - 文字颜色
- **Background Color** (`backcolor`) - 背景颜色

### 对齐
- **Align Left** (`alignleft`) - 左对齐
- **Align Center** (`aligncenter`) - 居中对齐
- **Align Right** (`alignright`) - 右对齐
- **Align Justify** (`alignjustify`) - 两端对齐

### 列表
- **Bullet List** (`bullist`) - 无序列表
- **Numbered List** (`numlist`) - 有序列表
- **Outdent** (`outdent`) - 减少缩进
- **Indent** (`indent`) - 增加缩进

### 插入
- **Link** (`link`) - 插入/编辑链接
- **Image** (`image`) - 插入图片
- **Table** (`table`) - 插入表格

### 其他
- **Undo** (`undo`) - 撤销
- **Redo** (`redo`) - 重做
- **Code** (`code`) - 源代码视图
- **Fullscreen** (`fullscreen`) - 全屏模式
- **Remove Format** (`removeformat`) - 清除格式

## 📝 使用场景

### 场景 1：博客文章编辑

```vue
<TinyMCEEditor
  v-model="article"
  :height="600"
  @change="handleArticleChange"
/>
```

### 场景 2：用户评论

```vue
<TinyMCEEditor
  v-model="comment"
  :height="200"
  toolbar="undo redo | bold italic | link"
  plugins="link"
  :menubar="false"
/>
```

### 场景 3：富文本表单

```vue
<el-form>
  <el-form-item label="内容">
    <TinyMCEEditor v-model="formData.content" :height="400" />
  </el-form-item>
</el-form>
```

### 场景 4：只读展示

```vue
<TinyMCEEditor
  v-model="readonlyContent"
  :disabled="true"
  :height="300"
  :menubar="false"
/>
```

## 🖼️ 图片处理

### 粘贴图片

可以直接粘贴图片（Ctrl+V），支持：
- 截图工具（QQ、微信等）
- 从其他网页复制
- 从文件管理器复制

### 拖拽上传

直接拖拽图片文件到编辑器即可插入。

### 自定义上传处理

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    images_upload_handler: async (blobInfo, progress) => {
      // 显示上传进度
      const formData = new FormData()
      formData.append('file', blobInfo.blob())
      
      const response = await axios.post('/api/upload', formData, {
        onUploadProgress: (e) => {
          const percent = (e.loaded / e.total) * 100
          progress(percent)
        }
      })
      
      return response.data.url
    },
    // 自动上传
    automatic_uploads: true,
    // 允许的文件类型
    file_picker_types: 'image'
  }"
/>
```

## ⚙️ 常用配置

### 配置占位符

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    placeholder: '请输入内容...'
  }"
/>
```

### 配置最小/最大高度

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    min_height: 300,
    max_height: 800,
    resize: true  // 允许调整大小
  }"
/>
```

### 配置自动保存

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    autosave_ask_before_unload: true,
    autosave_interval: '30s',
    autosave_retention: '2m'
  }"
/>
```

### 配置粘贴选项

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    paste_data_images: true,  // 允许粘贴图片
    paste_webkit_styles: 'all',
    paste_merge_formats: true
  }"
/>
```

## 🌐 国际化

组件已集成项目 i18n 系统，会自动跟随项目语言切换。

### 支持的语言

- 🇨🇳 **中文（zh-CN）** - 默认
- 🇺🇸 **English (en)** 
- 🇰🇷 **한국어 (ko)**
- 🇯🇵 **日本語 (ja)**

### 静态资源结构

```
public/tinymce/
├── tinymce.min.js   # 核心文件
├── skins/           # 皮肤文件
├── themes/          # 主题文件
├── plugins/         # 插件文件（30+）
├── icons/           # 图标文件
├── models/          # 模型文件
└── langs/           # 语言包
    ├── zh_CN.js     # 中文
    ├── ko_KR.js     # 韩文
    └── ja.js        # 日文
```

*注：英文是 TinyMCE 默认语言，无需语言包*

### 多语言元素

- ✅ 编辑器界面（菜单、工具栏、按钮）
- ✅ 对话框（插入链接、图片等）
- ✅ 格式选项（段落、标题等）
- ✅ 颜色名称（黑、白、红等）
- ✅ 提示信息（错误、警告等）

## 🔒 安全建议

### 1. XSS 防护

展示用户输入的 HTML 内容时，使用 `vue-dompurify-html`：

```vue
<template>
  <!-- ❌ 不安全 -->
  <div v-html="userContent"></div>
  
  <!-- ✅ 安全 -->
  <div v-dompurify-html="userContent"></div>
</template>
```

### 2. 内容验证

```typescript
// 后端验证
app.post('/api/save', (req, res) => {
  const content = sanitizeHtml(req.body.content, {
    allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'img', 'a'],
    allowedAttributes: {
      'a': ['href', 'target'],
      'img': ['src', 'alt']
    }
  })
  // 保存 content
})
```

### 3. 文件上传安全

```typescript
// 验证文件类型和大小
images_upload_handler: async (blobInfo) => {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(blobInfo.blob().type)) {
    throw new Error('不支持的图片格式')
  }
  
  // 检查文件大小（5MB）
  if (blobInfo.blob().size > 5 * 1024 * 1024) {
    throw new Error('图片大小不能超过 5MB')
  }
  
  // 上传...
}
```

## 📊 性能优化

### 1. 按需加载插件

只加载需要的插件，减少加载时间：

```vue
<TinyMCEEditor
  toolbar="undo redo | bold italic"
  plugins="lists"  <!-- 只加载 lists 插件 -->
/>
```

### 2. 图片上传到服务器

避免使用 base64，减小内容大小：

```vue
<TinyMCEEditor
  :init="{
    images_upload_handler: async (blobInfo) => {
      const response = await uploadToServer(blobInfo.blob())
      return response.url  // 返回 URL 而不是 base64
    }
  }"
/>
```

### 3. 懒加载

对于页面中多个编辑器实例，使用懒加载：

```vue
<template>
  <div v-if="showEditor">
    <TinyMCEEditor v-model="content" />
  </div>
</template>

<script setup lang="ts">
const showEditor = ref(false)

onMounted(() => {
  setTimeout(() => {
    showEditor.value = true
  }, 500)
})
</script>
```

## 🐛 常见问题

### Q: 编辑器无法加载？

**A:** 确保 `public/tinymce/` 目录存在完整的静态资源。检查以下文件是否存在：

- `public/tinymce/tinymce.min.js` - 核心文件
- `public/tinymce/skins/` - 皮肤目录
- `public/tinymce/themes/` - 主题目录
- `public/tinymce/plugins/` - 插件目录

### Q: 界面显示为英文？

**A:** 检查当前项目语言设置和语言包。

1. 确认项目当前语言是 zh-CN
2. 确认语言包文件存在：`public/tinymce/langs/zh_CN.js`
3. 如果语言包缺失，手动下载：

```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/zh_CN.js" -OutFile "public/tinymce/langs/zh_CN.js"
```

### Q: 对话框取消按钮不工作？

**A:** 已修复。项目的全局防重复点击已配置为不影响 TinyMCE。

### Q: 在 Drawer/Dialog 中使用时，下拉菜单和弹出框被遮挡？

**A:** 这是 z-index 层级问题。组件已通过**三重保护**机制完全解决此问题：

1. **TinyMCE 配置层面**：设置 `base_z_index: 10000`
2. **CSS 样式层面**：强制所有 TinyMCE 弹出层 `z-index: 10000 !important`
3. **组件配置层面**：DrawerTabs 的 `appendToBody: false`

**解决方案（已自动配置，无需任何额外操作）：**

```vue
<!-- 开箱即用，所有弹出层都能正常显示 -->
<el-drawer v-model="visible" title="编辑" size="70%">
  <TinyMCEEditor v-model="content" :height="400" />
</el-drawer>
```

**已解决的问题：**
- ✅ 弹出层不再被 Drawer 遮挡
- ✅ 防止重复点击弹出多个层
- ✅ 格式下拉菜单正常显示
- ✅ 颜色选择器正常显示
- ✅ 插入链接/图片对话框正常工作
- ✅ 表格编辑菜单正常显示
- ✅ 全屏模式正常工作

**自定义 z-index（如特殊需求）：**

```vue
<!-- 如果在极特殊场景下需要更高的 z-index -->
<TinyMCEEditor 
  v-model="content" 
  :z-index="20000"  
/>
```

### Q: 生产环境无法加载？

**A:** 确保部署时包含了 `public/tinymce/` 整个目录。

```bash
# 检查构建输出
ls dist/tinymce/
```

### Q: 如何获取纯文本内容？

**A:** 使用编辑器方法去除 HTML 标签：

```typescript
const editor = editorRef.value?.getEditor()
const text = editor?.getContent({ format: 'text' })
```

### Q: 如何限制内容长度？

**A:** 使用 `max_chars` 配置：

```vue
<TinyMCEEditor
  v-model="content"
  :init="{
    max_chars: 5000,  // 最多 5000 字符
    setup: (editor) => {
      editor.on('input', () => {
        const text = editor.getContent({ format: 'text' })
        if (text.length > 5000) {
          // 提示用户
        }
      })
    }
  }"
/>
```

## 📚 完整示例

查看 `src/views/curriculum/example/TinyMCEExample.vue` 了解完整的使用示例，包括：

- ✅ 基础示例
- ✅ 禁用状态示例
- ✅ 无菜单栏示例
- ✅ 极简工具栏示例
- ✅ 编辑器操作示例

访问路由：`/tinymce/example`

## 🛠️ 维护和更新

### 更新 TinyMCE 版本

```bash
# 1. 更新依赖包
pnpm add tinymce@新版本 @tinymce/tinymce-vue@新版本

# 2. 手动复制静态资源
# Windows PowerShell
Copy-Item -Path node_modules/tinymce/skins -Destination public/tinymce/skins -Recurse -Force
Copy-Item -Path node_modules/tinymce/themes -Destination public/tinymce/themes -Recurse -Force
Copy-Item -Path node_modules/tinymce/plugins -Destination public/tinymce/plugins -Recurse -Force
Copy-Item -Path node_modules/tinymce/icons -Destination public/tinymce/icons -Recurse -Force
Copy-Item -Path node_modules/tinymce/models -Destination public/tinymce/models -Recurse -Force
Copy-Item -Path node_modules/tinymce/tinymce.min.js -Destination public/tinymce/tinymce.min.js -Force

# Linux/macOS
cp -r node_modules/tinymce/skins public/tinymce/
cp -r node_modules/tinymce/themes public/tinymce/
cp -r node_modules/tinymce/plugins public/tinymce/
cp -r node_modules/tinymce/icons public/tinymce/
cp -r node_modules/tinymce/models public/tinymce/
cp node_modules/tinymce/tinymce.min.js public/tinymce/
```

### 添加新语言

1. 从 TinyMCE CDN 下载语言包：

```bash
# Windows PowerShell（例如法语）
Invoke-WebRequest -Uri "https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/fr_FR.js" -OutFile "public/tinymce/langs/fr_FR.js"

# Linux/macOS
curl -o public/tinymce/langs/fr_FR.js https://cdn.tiny.cloud/1/no-api-key/tinymce/6/langs/fr_FR.js
```

2. 在组件中添加语言映射：

```typescript
// src/components/TinyMCE/src/TinyMCEEditor.vue
const tinymceLanguageMap = {
  'zh-CN': { code: 'zh_CN', url: '/tinymce/langs/zh_CN.js' },
  'en': { code: null, url: null },
  'ko': { code: 'ko_KR', url: '/tinymce/langs/ko_KR.js' },
  'ja': { code: 'ja', url: '/tinymce/langs/ja.js' },
  // 添加新语言
  'fr': { code: 'fr_FR', url: '/tinymce/langs/fr_FR.js' }
}
```

3. 添加格式和颜色翻译（可选）

```typescript
// 在 getBlockFormats 和 getColorMap 函数中添加对应语言
```

## 📖 参考资源

### 官方文档
- [TinyMCE 官方文档](https://www.tiny.cloud/docs/)
- [TinyMCE Vue 集成](https://www.tiny.cloud/docs/integrations/vue/)
- [TinyMCE 配置选项](https://www.tiny.cloud/docs/configure/)
- [TinyMCE API 参考](https://www.tiny.cloud/docs/tinymce/latest/apis/)

### 项目文档
- **快速开始**：`docs/TINYMCE_QUICKSTART.md`
- **菜单配置**：`docs/TINYMCE_MENUBAR_CONFIG.md`
- **完整示例**：`src/views/curriculum/example/TinyMCEExample.vue`

## 💡 最佳实践

### 1. 内容清理

```typescript
import DOMPurify from 'dompurify'

// 清理用户输入的 HTML
const cleanHtml = DOMPurify.sanitize(userHtml)
```

### 2. 图片压缩

```typescript
images_upload_handler: async (blobInfo) => {
  // 压缩图片
  const compressedBlob = await compressImage(blobInfo.blob())
  // 上传压缩后的图片
  const url = await uploadImage(compressedBlob)
  return url
}
```

### 3. 内容保存提示

```vue
<script setup lang="ts">
const hasUnsavedChanges = ref(false)

const handleChange = () => {
  hasUnsavedChanges.value = true
}

// 页面离开提示
onBeforeUnmount(() => {
  if (hasUnsavedChanges.value) {
    const confirmed = confirm('有未保存的内容，确定离开？')
    if (!confirmed) {
      // 阻止离开
    }
  }
})
</script>
```

### 4. 响应式布局

```vue
<template>
  <TinyMCEEditor
    v-model="content"
    :height="editorHeight"
  />
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { height } = useWindowSize()
const editorHeight = computed(() => height.value - 300)
</script>
```

## ⚡ 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+B | 粗体 |
| Ctrl+I | 斜体 |
| Ctrl+U | 下划线 |
| Ctrl+Z | 撤销 |
| Ctrl+Y | 重做 |
| Ctrl+K | 插入链接 |
| Ctrl+V | 粘贴（支持图片）|
| Ctrl+Shift+F | 全屏 |

## 🎯 技术细节

### 部署方式
- **自托管**：所有资源在 `public/tinymce/`
- **路径自适应**：自动适配项目的 BASE_URL

### 文件大小
- 核心文件：~500KB
- 插件：~2MB（按需加载）
- 语言包：~50KB/个

### 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 技术支持

遇到问题？

1. 查看示例页面：`/tinymce/example`
2. 查看完整文档：`docs/TINYMCE_QUICKSTART.md`
3. 查看官方文档：[TinyMCE Docs](https://www.tiny.cloud/docs/)

---

**版本信息**
- TinyMCE: 8.3.2
- Vue 集成: @tinymce/tinymce-vue 6.x
- 部署方式: 自托管 (Self-hosted)，自托管需在 init 中设置 `license_key: 'gpl'`
- 更新日期: 2025-02-10
