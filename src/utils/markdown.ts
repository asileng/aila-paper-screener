import type { Paper, ScreeningState, Zone } from '../types';

export function exportMarkdown(papers: Paper[], screening: ScreeningState): string {
  const groups: Record<string, Paper[]> = { relevant: [], reference: [], trash: [], unscreened: [] };
  for (const p of papers) {
    const a = screening[p.id];
    if (!a || !a.zone) groups.unscreened.push(p);
    else groups[a.zone].push(p);
  }

  const lines: string[] = [
    '# AILA论文筛选结果',
    '',
    `**生成时间**: ${new Date().toLocaleString('zh-CN')}`,
    `**论文总数**: ${papers.length}`,
    '',
    '## 统计摘要',
    '',
    '| 区域 | 数量 |',
    '|------|------|',
    `| 高相关区 | ${groups.relevant.length} |`,
    `| 参考区 | ${groups.reference.length} |`,
    `| 垃圾区 | ${groups.trash.length} |`,
    `| 未筛选 | ${groups.unscreened.length} |`,
    '',
  ];

  const zoneLabels: Record<string, string> = {
    relevant: '高相关区',
    reference: '参考区',
    trash: '垃圾区',
    unscreened: '未筛选',
  };

  const order: string[] = ['relevant', 'reference', 'trash', 'unscreened'];

  for (const zone of order) {
    const list = groups[zone];
    if (list.length === 0) continue;

    lines.push(`## ${zoneLabels[zone]}（${list.length}篇）`);
    lines.push('');
    lines.push('| # | 标题 | 作者 | 年份 | 引用 | 评分 | 标签 | DOI |');
    lines.push('|---|------|------|------|------|------|------|-----|');

    list.sort((a, b) => (screening[b.id]?.rating || 0) - (screening[a.id]?.rating || 0));

    list.forEach((p, i) => {
      const a = screening[p.id];
      const stars = a?.rating ? '★'.repeat(a.rating) + '☆'.repeat(5 - a.rating) : '-';
      const tags = a?.tags?.join(', ') || '';
      const doiLink = p.DOI ? `[${p.DOI.replace('https://doi.org/', '')}](${p.DOI})` : '';
      const shortAuthors = p.Authors.length > 40 ? p.Authors.slice(0, 37) + '...' : p.Authors;
      lines.push(`| ${i + 1} | ${p.Title} | ${shortAuthors} | ${p.Year} | ${p.CitedBy} | ${stars} | ${tags} | ${doiLink} |`);
    });

    lines.push('');
  }

  return lines.join('\n');
}
