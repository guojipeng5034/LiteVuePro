/**
 * 构建前将 package.json 的 version 写入 public/version.json
 * 便于前端拉取版本信息
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version || '0.0.0';
const outDir = path.join(root, 'public');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'version.json'),
  JSON.stringify({ version, releaseNotesUrl: '-' }, null, 2)
);
