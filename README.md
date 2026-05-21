# AILA 论文筛选系统 — 项目总览

**仓库**: https://github.com/asileng/aila-paper-screener
**部署**: https://asileng.github.io/aila-paper-screener/
**本地路径**: `D:\task\科研\AILA\paper-screener`

---

## 一、项目本质

这是一个**面向会议/期刊投稿的快速文献定位工具**。核心流程：

```
搜集相关文献 → 打包为统一 JSON → 交互式网页筛选 → 输出知识库
```

- **输入**: 来自 OpenAlex、arXiv、Semantic Scholar 的论文元数据（217 篇，覆盖 6 个研究主题）
- **操作**: 浏览器中逐篇阅读摘要，拖拽或快捷键分配到三区（高相关 / 参考 / 排除），并打标签、评分、写备注
- **输出**: 按区分组的 BibTeX（可导入 Zotero）和 Markdown 表格（可直接用于报告附件）

最终产物是一个**经过人工筛选标注的论文知识库**，可作为写作阶段的参考源。

可以结合：蜘蛛文献网络关联检索、nuwa skills 进行筛选等等。

---

## 二、技术路径与可复用组件

### 完整文件清单

```
paper-screener/
├── .github/workflows/deploy.yml    # CI/CD: push → 自动构建 + 部署 GitHub Pages
├── vite.config.ts                   # Vite 配置 (base 路径、React + Tailwind 插件)
├── package.json                     # 依赖: React 19, @dnd-kit, TailwindCSS 4, TS
├── index.html                       # 入口 HTML
├── public/papers.json               # 规范化后的论文数据 (217 篇)
├── specs/SPEC.md                    # 技术规格（组件 API、数据流、类型契约、扩展指南）
├── prompts/PROMPTS.md               # 数据采集层 LLM prompt 模板
├── docs/README.md                   # 用户使用文档
├── src/
│   ├── main.tsx                     # 入口: 挂载 <ScreeningProvider><App/></ScreeningProvider>
│   ├── App.tsx                      # 主布局: DndContext + 筛选栏 + 列表 + 详情 + 三区 + 快捷键
│   ├── store.tsx                    # 状态管理: Context + useReducer + localStorage 持久化
│   ├── types.ts                     # 类型定义: Paper / Zone / PaperAssignment / FilterState / Action
│   ├── index.css                    # TailwindCSS 全局样式
│   ├── components/
│   │   ├── PaperCard.tsx            # 论文卡片 (拖拽源, 显示标题/引用/Topic/评分/标签)
│   │   ├── PaperList.tsx            # 论文列表 (可滚动容器)
│   │   ├── PaperDetail.tsx          # 详情面板 (摘要/链接/评分/标签/备注/分配按钮)
│   │   ├── FilterBar.tsx            # 筛选栏 (年份/主题/OA/引用/来源/标题搜索/重置)
│   │   ├── DropZone.tsx             # 放置区 (三个区域之一, 可折叠)
│   │   ├── ViewToggle.tsx           # 简洁/详情视图切换
│   │   ├── StarRating.tsx           # 1-5 星评分
│   │   ├── TagInput.tsx             # 标签输入 (Enter 添加, Backspace 删除)
│   │   └── ExportPanel.tsx          # 导出按钮 (BibTeX / Markdown / 重置)
│   └── utils/
│       ├── normalize.ts             # 数据规范化: Year→number, 生成唯一 id
│       ├── filter.ts                # 六维筛选: 年份/主题/OA/引用/来源/标题搜索
│       ├── bibtex.ts                # BibTeX 导出 + 通用下载函数
│       ── markdown.ts              # Markdown 表格导出
```

### 核心数据结构（types.ts）

```typescript
interface Paper {
  id: string; Topic: string; Title: string; Year: number;
  Authors: string; Venue: string; CitedBy: number;
  OA: boolean; OA_URL: string; DOI: string; ArXivID: string;
  Abstract: string; Source: string;
}

interface PaperAssignment {
  zone: 'trash' | 'relevant' | 'reference' | null;
  tags: string[]; rating: number; notes: string;
}

interface FilterState {
  yearRange: [number, number]; topics: string[]; oaOnly: boolean;
  citationMin: number; sources: string[]; venueSearch: string;
}
```

### 可复用组件清单

| 组件/工具 | 可复用到什么场景 | 复用方式 |
|-----------|----------------|---------|
| `PaperCard.tsx` | 任何需要展示论文卡片的列表 | 替换 Paper 类型字段，调整显示内容 |
| `StarRating.tsx` | 任何 1-5 评分场景 | 纯 UI 组件，零依赖，直接复制 |
| `TagInput.tsx` | 任何标签/关键词输入场景 | 纯 UI 组件，直接复制 |
| `ViewToggle.tsx` | 任何双视图切换场景 | 零依赖，直接复制 |
| `FilterBar.tsx` | 任何需要多条件筛选的列表 | 根据新数据源修改 FilterState 和筛选逻辑 |
| `DropZone.tsx` | 任何拖拽分类场景 | 修改 zoneConfig 颜色和标签即可 |
| `normalize.ts` | 任何论文 JSON → 前端 Paper 类型转换 | 根据新数据源调整字段映射 |
| `filter.ts` | 任何基于 Paper 类型的筛选 | 增加/减少筛选维度 |
| `bibtex.ts` | 任何论文导出场景 | 可追加 RIS、EndNote 等格式 |
| `markdown.ts` | 任何表格导出场景 | 修改表格列和分组逻辑 |
| `store.tsx` | 任何需要 localStorage 持久化的状态管理 | 替换 Action 类型和 reducer |

### 新 Agent 复用步骤

1. 保留 `types.ts` 中的 `Paper` 接口定义（或根据新数据源调整）
2. 替换 `public/papers.json` 数据源
3. 根据需求增减 `FilterState` 和 `Action` 类型
4. 保留 `store.tsx` 的 Context + useReducer 模式
5. 复用所有 UI 组件（FilterBar, PaperCard, DropZone 等）
6. 运行 `npm install && npm run dev` 启动

---

## 三、使用方法

### 当前项目怎么用

**在线使用**（无需安装）:
1. 打开 https://asileng.github.io/aila-paper-screener/
2. 左侧列表显示所有未筛选论文
3. 点击论文 → 右侧详情面板展示摘要、链接、评分等
4. **拖拽**论文到底部三区，或用**键盘快捷键**快速分配：
   - `↑↓` 上下导航，`1` = 垃圾区，`2` = 高相关区，`3` = 参考区
   - `0` = 取消分配，`Esc` = 取消选中
5. 使用顶部筛选栏缩小范围（年份、主题、OA、引用数、来源、标题搜索）
6. 勾选"显示已筛选"可查看所有论文
7. 点击右上角导出 BibTeX 或 Markdown 文件

**本地开发**:
```bash
cd D:\task\科研\AILA\paper-screener
npm install
npm run dev        # 开发服务器: http://localhost:5173
npm run build      # 生产构建
```

### 如何为新目的调试/定制

**更换数据源**: 替换 `public/papers.json`，确保字段与 `types.ts` 的 `Paper` 接口一致。可运行父目录下的 Python 脚本重新搜集数据。

**修改筛选维度**: 在 `types.ts` 的 `FilterState` 中添加新字段 → 在 `filter.ts` 中添加筛选逻辑 → 在 `FilterBar.tsx` 中添加 UI 控件。

**添加导出格式**: 在 `utils/` 中新建导出函数 → 在 `ExportPanel.tsx` 中添加按钮。

**添加新交互**: 组件都是纯函数组件，Props 明确，独立可测。每个组件只依赖 `types.ts` 中的类型，无隐式耦合。

---

## 四、未来开发方向

1. **文献扩充与关联建立** — 接入 OpenAlex API 实时搜索，通过 DOI 自动抓取引用关系，从 Semantic Scholar 获取语义相似度，支持从 BibTeX/RIS 文件导入
2. **GUI 优化** — 内嵌超链接、封面展示、论文预览（react-pdf）、双栏模式、暗色模式
3. **文献图谱构建** — 时间线视图、引用网络图（react-force-graph/d3-force）、概念关联图、理论脉络自动生成
4. **与文献搜集流程整合** — Python 脚本输出直接接入前端，建立"搜集→规范化→筛选→导出"一键流水线，支持增量更新

---

## 五、关键技术决策记录

| 决策 | 原因 | 替代方案 |
|------|------|---------|
| Vite + React + TS | 快速原型、TypeScript 类型安全 | Vue、Next.js |
| @dnd-kit 拖拽 | 替代已废弃的 react-beautiful-dnd | react-dnd |
| Context + useReducer | 轻量、无需额外依赖 | Redux、Zustand |
| localStorage 持久化 | 零后端、跨会话保留 | IndexedDB、后端 API |
| TailwindCSS v4 | 原子化 CSS、无需手写样式文件 | CSS Modules、styled-components |
| GitHub Pages 部署 | 免费、CI/CD 自动化 | Netlify、Vercel |

---

## 六、已知坑

1. **Vite 子目录部署**: `vite.config.ts` 必须设置 `base: '/repo-name/'`，否则页面空白
2. **硬编码路径**: `fetch('/xxx.json')` 需改为 `fetch(\`${import.meta.env.BASE_URL}xxx.json\`)`
3. **Year 类型不一致**: JSON 中 Year 可能是 string 或 number，normalize 层统一处理
