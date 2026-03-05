import type { Editor, RawEditorOptions } from 'tinymce'

export interface TinyMCEProps {
  modelValue?: string
  disabled?: boolean
  height?: string | number
  width?: string | number
  toolbar?: string | string[]
  plugins?: string | string[]
  menubar?: string | boolean
  init?: RawEditorOptions
  /** z-index 基础值，用于解决在 Drawer/Dialog 中的层级问题，默认 10000 */
  zIndex?: number
  /** 最大字符数限制，0 表示无限制 */
  maxLength?: number
  /** 是否显示字数统计 */
  showWordCount?: boolean
}

export interface TinyMCEEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string, editor: Editor): void
  (e: 'init', editor: Editor): void
  (e: 'focus', editor: Editor): void
  (e: 'blur', editor: Editor): void
}

