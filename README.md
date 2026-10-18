# 创游实验室

一个以小游戏项目为主线的中文 Cocos Creator / Unity 学习工作台。关键概念提供中英文对照。

## 启动

需要 Node.js 22.18+（本环境已验证 Node.js 24）和 npm。

```bash
cd /workspace/genesis
npm ci
npm run dev -- --port 5173
```

构建与验证：

```bash
npm run build
npm test
npx playwright test
```

浏览器测试使用环境中的 `/usr/bin/chromium`。生成文件位于 `dist/`；可用 `npm run preview` 检查生产构建。开发服务在新任务中需要重新启动。

## GitHub Pages 发布

仓库已准备自动部署配置：`.github/workflows/deploy-pages.yml`。在 GitHub 仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**，再运行工作流（或向 `main` 推送提交）。

项目站点路径为 `/genesis/`，生产构建使用：

```bash
npm run build:pages
```

部署成功后的网址为 `https://revenge2myself.github.io/genesis/`。普通本地开发仍使用 `npm run dev`。若尚未启用 Pages 或部署尚未成功，该网址不代表网站已经上线。

## 学习内容与功能

- 12 个小游戏项目，每章 6 天，总计 72 天、396 小时。
- 每天 45 分钟理解概念、90 分钟 Cocos 实作、90 分钟 Unity 对照、75 分钟独立挑战、30 分钟复盘；休息另计。
- 每天都有具体目标、制作步骤、两个引擎的实现提示和验收标准。
- 每章包含双引擎代码片段、双语术语、自测题、交付物、常见问题与官方文档。
- 项目筛选与搜索、每日任务、专注计时、自动保存、作品记录、笔记及 JSON 备份导入导出。
- 商业路线包含广告适配与留存、Steam 发行准备，以及 Switch 平台申请和获批前可完成的开发准备。

学习顺序建议：弹球 → 小鸟 → 打砖块 → 跑酷 → 消除 → 塔防 → 农场 → 地牢 → 生存 → 广告小游戏 → Steam 迷你作品 → 手柄平台游戏。每章都分别使用两个引擎完成同一核心玩法。

## 使用说明

页面本身无需账户、数据库或 API 密钥。记录保存在当前浏览器的 `localStorage`（键名 `gamecraft-progress-v1`），不自动同步到其他设备，建议定期导出备份。专注计时仅在开启且页面打开时记录，刷新后暂停。勾选任务是个人学习记录，并不表示系统已验证引擎运行结果。

网页提供课程，Cocos Creator 与 Unity 编辑器需在自己的开发电脑上安装；引擎代码片段为教学参考，需要按章节要求配置场景、组件与输入后验证。本云环境验证的是学习网站，没有安装或运行这两个图形编辑器。

课程按 Cocos Creator 3.x 和 Unity 6 编排，使用受支持的稳定版本并固定项目版本。Steam 与 Nintendo Switch 发行需要各自的平台账户、许可、审批及所需硬件/工具；桌面原型测试不等于 Switch 真机验收。课程不保证收入。

## 项目结构

- `src/data/courses.ts`：完整项目课程数据。
- `src/components/LessonPanel.tsx`：章节课堂。
- `src/components/GameArt.tsx`：本地 SVG 游戏插画，无外部图片依赖。
- `src/App.tsx`：总览、计划、对照、发行与学习记录。
- `src/progress.ts`：学习记录校验与导入处理。

现有工作区最初为空，此页面直接创建于现有 checkout；没有删除原有仓库内容。字体使用系统中文字体，无需外部字体服务。
