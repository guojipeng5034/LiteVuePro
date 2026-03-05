/**
 * 消息与确认弹窗封装（ElMessage + ElMessageBox，由 unplugin-auto-import 自动注入）
 */
import { useI18n } from 'vue-i18n';

export function useMessage() {
  const { t } = useI18n();

  return {
    success: (msg: string) => ElMessage.success(msg),
    error: (msg: string) => ElMessage.error(msg),
    warning: (msg: string) => ElMessage.warning(msg),
    info: (msg: string) => ElMessage.info(msg),
    /** 删除二次确认，确认后不 resolve 具体值，仅表示用户点了确定 */
    delConfirm: () =>
      ElMessageBox.confirm(t('common.confirm') + t('common.delConfirmTip', { defaultValue: '删除后不可恢复，是否继续？' }), t('common.delConfirmTitle', { defaultValue: '删除确认' }), {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      }),
    /** 导出二次确认 */
    exportConfirm: () =>
      ElMessageBox.confirm(t('common.exportConfirmTip', { defaultValue: '是否确认导出所有数据？' }), t('common.exportConfirmTitle', { defaultValue: '导出确认' }), {
        type: 'warning',
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      }),
  };
}
