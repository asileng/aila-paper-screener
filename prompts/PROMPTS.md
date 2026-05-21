# LLM Prompts — AILA 论文筛选系统

本项目前端为纯 React SPA，无 LLM 调用。以下记录数据采集层（Python 脚本）中使用的 prompt 和查询模板。

## 数据搜集 Prompts

### arXiv API 查询 (`download_papers.py`)

```
目标: 从 arXiv API 抓取应用语言学/AI相关论文

查询参数:
  search_query: (cat:cs.CL OR cat:cs.AI) AND (abstract:"large language model" OR abstract:"applied linguistics")
  max_results: 200
  sortBy: submittedDate
  sortOrder: descending

输出格式: JSON (Title, Authors, Published, Summary, DOI, arXivID)
```

### Topic 6 定向查询 (`download_topic6.py`)

```
目标: 针对 ADHD/身份认同主题定向搜集论文

查询参数:
  search_query: cat:cs.CL AND (abstract:"ADHD" OR abstract:"identity" OR abstract:"neurodiversity")
  max_results: 100
```

### OpenAlex 查询 (`download_more.py`)

```
目标: 从 OpenAlex 搜索应用语言学期刊论文

API: https://api.openalex.org/works
参数:
  filter: topics.display_name:"Applied linguistics"
  sort: cited_by_count:desc
  per_page: 200
  source: ["S16744441", "S108074651"]  # AILA Review, Annual Review of Applied Linguistics
```

## 元数据生成 Prompts (`generate_metadata.py`)

```
系统提示:
你是一个学术文献分析助手。请根据提供的论文元数据，生成一份结构化的文献综述报告。

要求:
1. 按主题分组论文
2. 每个主题下统计论文数量、年份分布、引用分布
3. 列出高被引论文（Top 10）
4. 识别研究空白

输入格式: JSON 数组，每篇论文包含 Topic, Title, Year, Authors, Venue, CitedBy, Abstract
输出格式: Markdown 报告
```

## 分析报告生成 Prompts (`generate_analysis.py`)

```
系统提示:
你是一个应用语言学领域的研究分析师。请根据论文数据，撰写一份关于 AILA (International Association of Applied Linguistics) 研究趋势的分析报告。

分析维度:
1. 时间趋势: 各主题论文数量随年份变化
2. 方法分布: 量化/质性/混合方法比例
3. 技术采用: LLM/BERT/多模态等技术关键词出现频率
4. 期刊分布: 各主题在哪些期刊发表最多

输出要求:
- 包含数据表格
- 每个结论需有数据支撑
- 用中性学术语言，避免主观评价
```

## 数据合并 Prompts (`merge_supplementary.py`, `filter_and_merge_aila.py`)

```
系统提示:
你是一个数据处理助手。请合并多个来源的论文元数据，去重并规范化字段。

去重规则:
1. DOI 相同 → 视为同一篇
2. 标题完全相同 → 视为同一篇
3. 标题相似度 > 95% → 人工确认

规范化:
- Year: 统一为整数
- Authors: 分号分隔
- Topic: 标准化为预定义主题名
```
