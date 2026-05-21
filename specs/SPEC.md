# AILA 论文筛选系统 — 规格说明

## Overview

针对学术会议/期刊投稿的快速文献定位工具。从 OpenAlex、arXiv、Semantic Scholar 搜集论文元数据，打包为统一 JSON，通过交互式网页进行拖拽筛选（三区分类），输出 BibTeX 和 Markdown 格式的知识库。

## 核心流水线

```
数据搜集 ─→ 规范化 ──→ 打包 JSON ──→ 网页筛选 ──→ 导出知识库
(Python)      (TS)       (JSON)      (React SPA)   (TS utils)
```

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Python 爬虫   │───→│ 规范化/合并   │───→│ papers.json  │
│ OpenAlex     │    │ all_papers_  │    │ (public/)    │
│ arXiv/S2     │    │ merged.json  │    │              │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────┐
│ React SPA (Vite + TS + Tailwind)                     │
│ ├── FilterBar  (六维筛选)                            │
│ ├── PaperList  (论文列表 + 拖拽源)                   │
│ ├── PaperDetail (摘要/评分/标签/备注/分配按钮)       │
│ ├── DropZone x3 (垃圾区/高相关/参考区)               │
│ └── ExportPanel (BibTeX / Markdown 导出)             │
└──────────────────────────────────────────────────────┘
```

## 输入/输出

| 项目 | 说明 |
|------|------|
| **输入** | 原始论文 JSON（OpenAlex/arXiv/Semantic Scholar），字段：Topic, Title, Year, Authors, Venue, CitedBy, OA, OA_URL, DOI, ArXivID, Abstract, Source |
| **中间产物** | `all_papers_merged.json` — 多源合并后的原始数据；`public/papers.json` — 规范化后的前端数据 |
| **输出** | `aila_papers.bib` — 按区分组的 BibTeX（可导入 Zotero）；`aila_screening_result.md` — Markdown 统计表格 |

## 前端依赖

| 包 | 用途 |
|----|------|
| `@dnd-kit/core` | 拖拽系统（拖拽源 + 放置区） |
| `@dnd-kit/sortable` | 拖拽排序 |
| `@dnd-kit/utilities` | dnd-kit 工具函数 |
| `react` / `react-dom` | UI 框架 (v19) |
| `tailwindcss` + `@tailwindcss/vite` | 原子化样式 |
| `typescript` | 类型安全 |
| `vite` | 构建工具 |

## 可复用函数

### src/utils/normalize.ts
```typescript
// 原始数据 → 前端 Paper 类型
import { normalizePaper } from './src/utils/normalize'
```
- `normalizePaper(raw: Record<string, unknown>, index: number): Paper` — Year 类型统一、生成唯一 id（基于 title hash）

### src/utils/filter.ts
```typescript
import { filterPapers } from './src/utils/filter'
```
- `filterPapers(papers: Paper[], filters: FilterState): Paper[]` — 六维筛选（年份/主题/OA/引用/来源/标题搜索）

### src/utils/bibtex.ts
```typescript
import { exportBibtex, downloadFile } from './src/utils/bibtex'
```
- `exportBibtex(papers: Paper[], screening: ScreeningState): string` — 按区分组生成 BibTeX，区内按评分降序
- `downloadFile(content, filename, mimeType)` — 通用文件下载（Blob + a.download）
- `generateCiteKey(paper)` — 生成 BibTeX 引用键（作者+年份+标题首词）

### src/utils/markdown.ts
```typescript
import { exportMarkdown } from './src/utils/markdown'
```
- `exportMarkdown(papers: Paper[], screening: ScreeningState): string` — 按区分组生成 Markdown 表格，含统计摘要

### src/store.tsx
```typescript
import { ScreeningProvider, useScreening } from './src/store'
```
- `ScreeningProvider` — React Context + useReducer 状态管理
- `useScreening()` — hook，返回 screening / dispatch / getAssignment
- 自动同步 localStorage（key: `aila-paper-screener-state`）

## LLM Prompts

本项目前端无 LLM 调用。相关 prompt 模板在父目录 `D:\task\科研\AILA\` 下的 Python 脚本中：

- `download_papers.py` — arXiv 搜索查询
- `download_topic6.py` — Topic 6 定向查询
- `generate_metadata.py` — 元数据报告生成 prompt
- `generate_analysis.py` — 分析报告生成 prompt

完整 prompt 模板见 `D:\task\科研\AILA\prompts\`（若存在）。

## 项目结构

```
paper-screener/
├── .github/workflows/deploy.yml   # CI/CD: push → build → GitHub Pages
── vite.config.ts                  # base 路径 + React/Tailwind 插件
├── package.json
├── index.html
├── public/
│   └── papers.json                 # 217 篇规范化论文数据
├── specs/
│   └── SPEC.md                     # 本文件
├── prompts/
│   └── PROMPTS.md                  # LLM prompt 模板（若有）
├── src/
│   ├── main.tsx                    # 入口: ScreeningProvider > App
│   ├── App.tsx                     # 主布局: DndContext + 筛选栏 + 列表 + 详情 + 三区 + 快捷键
│   ├── store.tsx                   # Context + useReducer + localStorage
│   ├── types.ts                    # Paper / Zone / PaperAssignment / FilterState / Action
│   ├── index.css                   # TailwindCSS 全局样式
│   ├── components/
│   │   ├── PaperCard.tsx           # 拖拽卡片 (标题/引用/Topic/评分/标签)
│   │   ├── PaperList.tsx           # 列表容器
│   │   ├── PaperDetail.tsx         # 详情面板
│   │   ├── FilterBar.tsx           # 六维筛选栏
│   │   ├── DropZone.tsx            # 放置区
│   │   ├── ViewToggle.tsx          # 视图切换
│   │   ├── StarRating.tsx          # 1-5 星评分
│   │   ├── TagInput.tsx            # 标签输入
│   │   └── ExportPanel.tsx         # 导出 + 重置
│   └── utils/
│       ├── normalize.ts            # 数据规范化
│       ├── filter.ts               # 筛选逻辑
│       ├── bibtex.ts               # BibTeX 导出
│       └── markdown.ts             # Markdown 导出
└── dist/                           # 构建产物
```

## 复用工夫

### 快速启动新项目

```bash
# 1. 替换数据源
python <搜集脚本>  # 输出 all_papers_merged.json
cp all_papers_merged.json paper-screener/public/papers.json

# 2. 按需调整筛选维度
# 编辑 src/types.ts 的 FilterState
# 编辑 src/utils/filter.ts 的筛选逻辑
# 编辑 src/components/FilterBar.tsx 的 UI

# 3. 构建部署
npm run build
git push  # 自动触发 GitHub Actions 部署
```

### 组件级复用

| 组件 | 复用方式 |
|------|---------|
| `StarRating.tsx` | 零依赖纯 UI 组件，直接复制即可 |
| `TagInput.tsx` | 零依赖纯 UI 组件，直接复制即可 |
| `ViewToggle.tsx` | 零依赖，直接复制 |
| `PaperCard.tsx` | 替换 Paper 类型字段即可适配新数据源 |
| `DropZone.tsx` | 修改 zoneConfig 颜色和标签 |
| `bibtex.ts` | 通用 BibTeX 生成，替换 Paper 字段即可 |
| `downloadFile()` | 通用文件下载，零依赖 |

## 已知坑

1. **Vite 子目录部署**: `vite.config.ts` 必须设置 `base: '/repo-name/'`
2. **硬编码路径**: `fetch('/xxx.json')` → `fetch(\`${import.meta.env.BASE_URL}xxx.json\`)`
3. **Year 类型不一致**: normalize 层统一处理 string/number
