# AILA 论文筛选系统

面向会议/期刊投稿的快速文献定位工具。

**在线使用**: https://asileng.github.io/aila-paper-screener/

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建
```

## 文档

- `specs/SPEC.md` — 技术规格说明（流水线、数据结构、可复用函数）
- `docs/README.md` — 用户使用文档
- `prompts/PROMPTS.md` — 数据采集层 LLM prompt 模板
- `README.md`（旧版）— 项目总览，已被上述文档取代

## 核心功能

- **三区拖拽分类**: 垃圾区 / 高相关区 / 参考区
- **键盘快捷键**: ↑↓ 导航，1/2/3 分配，0 取消
- **六维筛选**: 年份 / 主题 / OA / 引用 / 来源 / 标题搜索
- **标注**: 1-5 星评分 / 自定义标签 / 备注
- **导出**: BibTeX（Zotero）/ Markdown 表格
- **持久化**: localStorage 自动保存

## 技术栈

Vite + React 19 + TypeScript + @dnd-kit + TailwindCSS 4
