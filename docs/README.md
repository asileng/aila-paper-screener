# AILA 论文筛选系统 — 使用文档

## 快速开始

### 在线使用

打开 https://asileng.github.io/aila-paper-screener/ 即可使用，无需安装。

### 本地开发

```bash
cd paper-screener
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建到 dist/
```

## 功能说明

### 核心流程

1. **浏览论文** — 左侧列表显示所有未筛选论文
2. **查看详情** — 点击论文，右侧展示摘要、DOI、OA 链接等
3. **分配区域** — 拖拽到底部三区，或按快捷键 `1/2/3`
4. **添加标注** — 评分（1-5 星）、标签、备注
5. **筛选缩小** — 按年份/主题/OA/引用/来源/标题搜索
6. **导出结果** — BibTeX（Zotero 导入）或 Markdown 表格

### 键盘快捷键

| 键 | 功能 |
|----|------|
| `↑↓` | 上下导航论文 |
| `1` | 分配到垃圾区 |
| `2` | 分配到高相关区 |
| `3` | 分配到参考区 |
| `0` | 取消分配 |
| `Esc` | 取消选中 |

分配后自动跳到下一篇，支持批量快速筛选。

### 数据持久化

所有筛选结果（区域分配、评分、标签、备注）自动保存到浏览器 localStorage，刷新页面不丢失。点击"重置"按钮清除所有数据。

## 定制指南

### 更换数据源

替换 `public/papers.json`，格式与 `src/types.ts` 的 `Paper` 接口一致：

```typescript
interface Paper {
  id: string;        // 唯一ID
  Topic: string;     // 研究主题
  Title: string;     // 标题
  Year: number;      // 年份
  Authors: string;   // 作者（分号分隔）
  Venue: string;     // 期刊/会议
  CitedBy: number;   // 引用数
  OA: boolean;       // 是否开放获取
  OA_URL: string;    // OA 链接
  DOI: string;       // DOI
  ArXivID: string;   // arXiv ID
  Abstract: string;  // 摘要
  Source: string;    // 数据源（OpenAlex/arXiv等）
}
```

### 增加筛选维度

1. `src/types.ts`: 在 `FilterState` 添加字段
2. `src/utils/filter.ts`: 添加筛选逻辑
3. `src/components/FilterBar.tsx`: 添加 UI 控件

### 增加导出格式

1. `src/utils/` 新建导出函数（如 `exportRIS.ts`）
2. `src/components/ExportPanel.tsx` 添加按钮

### 部署到 GitHub Pages

1. `vite.config.ts` 设置 `base: '/repo-name/'`
2. 硬编码路径用 `import.meta.env.BASE_URL`
3. Push 到 master 分支，GitHub Actions 自动部署
