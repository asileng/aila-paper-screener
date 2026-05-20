import type { Paper, ScreeningState, Zone } from '../types';

function generateCiteKey(paper: Paper): string {
  const firstAuthor = paper.Authors.split(';')[0].trim().split(' ').pop()?.toLowerCase() || 'unknown';
  const year = paper.Year;
  const titleWord = paper.Title.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  return `${firstAuthor}${year}${titleWord}`;
}

function paperToBibtex(paper: Paper): string {
  const key = generateCiteKey(paper);
  const authors = paper.Authors.replace(/; /g, ' and ');
  return [
    `@article{${key},`,
    `  title = {${paper.Title}},`,
    `  author = {${authors}},`,
    `  year = {${paper.Year}},`,
    `  journal = {${paper.Venue}},`,
    paper.DOI ? `  doi = {${paper.DOI}},` : '',
    paper.OA_URL ? `  url = {${paper.OA_URL}},` : '',
    '}',
  ].filter(Boolean).join('\n');
}

export function exportBibtex(papers: Paper[], screening: ScreeningState): string {
  const groups: Record<string, Paper[]> = { relevant: [], reference: [], trash: [], unscreened: [] };
  for (const p of papers) {
    const a = screening[p.id];
    if (!a || !a.zone) groups.unscreened.push(p);
    else groups[a.zone].push(p);
  }

  const order: Zone[] = ['relevant', 'reference', 'trash'];
  const sections: string[] = [];

  for (const zone of order) {
    const list = groups[zone];
    if (list.length === 0) continue;
    const label = zone === 'trash' ? 'Excluded' : zone === 'relevant' ? 'High Relevance' : 'Reference';
    sections.push(`% === ${label} (${list.length}) ===`);
    list.sort((a, b) => (screening[b.id]?.rating || 0) - (screening[a.id]?.rating || 0));
    sections.push(list.map(paperToBibtex).join('\n\n'));
  }

  if (groups.unscreened.length > 0) {
    sections.push(`% === Unscreened (${groups.unscreened.length}) ===`);
    sections.push(groups.unscreened.map(paperToBibtex).join('\n\n'));
  }

  return sections.join('\n\n');
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
