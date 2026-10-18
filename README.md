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
# 本地检查 Pages 构建（保留相同路径前缀）
npm run preview -- --base=/genesis/
```

部署成功后的网址为 `https://revenge2myself.github.io/genesis/`。普通本地开发仍使用 `npm run dev`。若尚未启用 Pages 或部署尚未成功，该网址不代表网站已经上线。

## 学习内容与功能

- 17 个项目章节（含 AI 美术和 4 次阶段验收），每章 6 天，总计 102 天、561 小时、510 项学习任务。
- 每天 45 分钟理解概念、90 分钟 Cocos 实作、90 分钟 Unity 对照、75 分钟独立挑战、30 分钟复盘；休息另计。
- 每天都有具体目标、制作步骤、两个引擎的实现提示和验收标准。
- 每章包含双引擎代码片段、双语术语、自测题、交付物、常见问题与官方文档。
- 第 2 章从零完成 AI 美术工作流：风格卡、提示词、透明背景、动画帧、图集优化与双引擎导入。
- AI 美术工坊提供可复制的课程模板、5 种原创占位素材的 PNG / SVG 下载和来源清单；无需购买素材或接入生成服务也能起步。
- 第 5、9、13、17 章为完整游戏验收，设可玩时长、测试证据、百分制评分和必过条件；达到 80 分且满足全部条件后显示“自评达标”。
- 项目类型筛选与搜索、每日任务、专注计时、自动保存、作品记录、笔记及 JSON 备份导入导出。
- 商业路线包含广告适配与留存、Steam 发行准备，以及 Switch 平台申请和获批前可完成的开发准备。

学习顺序：弹球 → 星光采集与 AI 美术 → 小鸟 → 打砖块 → **街机验收** → 跑酷 → 消除 → 塔防 → **策略验收** → 农场 → 地牢 → 生存 → **生存验收** → 广告小游戏 → Steam 迷你作品 → 手柄平台游戏 → **发行验收**。每章都分别使用两个引擎完成同一核心玩法。验收项目参考常见游戏机制，使用自己的素材、命名和关卡。

## 使用说明

页面本身无需账户、数据库或 API 密钥。记录保存在当前浏览器的 `localStorage`（键名 `gamecraft-progress-v1`），不自动同步到其他设备，建议定期导出备份。专注计时仅在开启且页面打开时记录，刷新后暂停。勾选任务与阶段验收分别记录；验收依据学员提交的作品与测试证据进行自评，不表示系统已验证引擎运行结果。旧版学习记录和备份可继续使用，增加章节后完成百分比会按新总量计算。

网页提供课程，Cocos Creator 与 Unity 编辑器需在自己的开发电脑上安装；引擎代码片段为教学参考，需要按章节要求配置场景、组件与输入后验证。本云环境验证的是学习网站，没有安装或运行这两个图形编辑器。

课程按 Cocos Creator 3.x 和 Unity 6 编排，使用受支持的稳定版本并固定项目版本。Steam 与 Nintendo Switch 发行需要各自的平台账户、许可、审批及所需硬件/工具；桌面原型测试不等于 Switch 真机验收。课程不保证收入。

## 项目结构

- `src/data/courses.ts`：完整课程顺序与基础项目数据。
- `src/data/aiArtCourse.ts`、`checkpointFoundations.ts`、`checkpointAdvanced.ts`：AI 美术与四个阶段验收课程。
- `src/components/ArtWorkbench.tsx`：提示词模板与原创素材导出。
- `src/curriculum.ts`：统一计算章节、任务、天数与学时。
- `src/components/LessonPanel.tsx`：章节课堂。
- `src/components/GameArt.tsx`：本地 SVG 游戏插画，无外部图片依赖。
- `src/App.tsx`：总览、计划、对照、发行与学习记录。
- `src/progress.ts`：学习记录校验与导入处理。

现有工作区最初为空，此页面直接创建于现有 checkout；没有删除原有仓库内容。字体使用系统中文字体，无需外部字体服务。
