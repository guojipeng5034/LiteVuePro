/**
 * 文件下载工具（导出 Excel 等）
 * 接口返回 Blob，前端触发下载
 */
function getBlobFilename(_headers: Headers): string {
  return 'download';
}

/**
 * 将 Blob 保存为文件（用于接口返回 Blob 的导出）
 * @param data Blob 或 ArrayBuffer
 * @param filename 文件名（当 data 为 Blob 且无 filename 时使用）
 */
function saveAs(data: Blob | ArrayBuffer, filename = 'download'): void {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const name = filename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 导出 Excel：当前项目 Mock/真实接口可能返回 JSON 或 Blob
 * 若接口返回 JSON，这里将 JSON 转成 CSV 或仅做占位下载；若返回 Blob 则直接下载
 */
const download = {
  /**
   * 接收接口返回的 Blob 或 ArrayBuffer，触发下载
   */
  blob(data: Blob | ArrayBuffer, filename: string): void {
    saveAs(data, filename);
  },

  /**
   * 导出 Excel：若 data 为 Blob 则直接下载；否则当作占位（Mock 常返回空或 JSON）
   */
  excel(data: Blob | ArrayBuffer | Record<string, unknown> | string, filename: string): void {
    if (data instanceof Blob) {
      saveAs(data, filename);
      return;
    }
    if (data instanceof ArrayBuffer) {
      saveAs(data, filename);
      return;
    }
    // Mock 或接口返回 JSON 时：生成简单 CSV 占位
    const str = typeof data === 'object' && data !== null ? JSON.stringify(data, null, 2) : String(data);
    const blob = new Blob(['\uFEFF' + str], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename.replace(/\.xls$/i, '.csv'));
  },
};

export default download;
