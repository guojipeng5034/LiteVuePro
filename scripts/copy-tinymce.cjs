/**
 * 将 node_modules/tinymce 复制到 public/tinymce，供自托管 TinyMCE 8 使用。
 * 在 postinstall 时自动执行。
 */
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const src = path.join(root, 'node_modules', 'tinymce')
const dest = path.join(root, 'public', 'tinymce')

if (!fs.existsSync(src)) {
  console.log('copy-tinymce: node_modules/tinymce 不存在，跳过复制（请先安装依赖）')
  process.exit(0)
}

try {
  if (fs.existsSync(dest)) {
    try {
      fs.rmSync(dest, { recursive: true, force: true })
    } catch (rmErr) {
      if (rmErr.code === 'EPERM' || rmErr.code === 'EBUSY') {
        console.error('copy-tinymce: public/tinymce 被占用，请先关闭 dev 服务或释放该目录后重试')
        console.error('copy-tinymce: 提示: 停止 npm run dev，再执行 npm install')
        process.exit(1)
      }
      throw rmErr
    }
  }
  fs.cpSync(src, dest, { recursive: true })
  console.log('copy-tinymce: 已复制 TinyMCE 到 public/tinymce')
} catch (err) {
  if (err.code === 'EPERM' || err.code === 'EBUSY') {
    console.error('copy-tinymce: 权限被拒，public/tinymce 可能被占用')
    console.error('copy-tinymce: 请关闭 dev 服务后重试 npm install')
  } else {
    console.error('copy-tinymce: 复制失败', err.message)
  }
  process.exit(1)
}
