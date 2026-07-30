# LeetCode Hot 100 · 背题训练场

极简黑白灰风格的 LeetCode Hot 100 本地背题站。支持分类 / 难度筛选、完成进度、核心思路回顾，以及多语言题解与 ACM 模板对照。

## 本地运行

```bash
pnpm install
pnpm dev
```

浏览器打开提示的本地地址（默认 `http://localhost:5173`）。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发 |
| `pnpm build` | 生产构建到 `dist/` |
| `pnpm preview` | 预览构建结果 |
| `pnpm validate:categories` | 校验题库分类是否完整 |

## 目录结构

```
src/                 # 页面与组件
public/              # 静态资源（含 leetcode_data.json）
scripts/             # 校验脚本与原始题库 JSON
.github/workflows/   # GitHub Pages 部署
```

完成进度保存在浏览器 `localStorage`（key: `leetcode-hot100-completed`）。

## 部署

推送到 `main` 后，GitHub Actions 会自动构建并发布到 GitHub Pages。
