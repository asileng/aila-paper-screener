import type { Paper, ScreeningState } from '../types';
import { exportBibtex, downloadFile } from '../utils/bibtex';
import { exportMarkdown } from '../utils/markdown';

interface ExportPanelProps {
  papers: Paper[];
  screening: ScreeningState;
}

export function ExportPanel({ papers, screening }: ExportPanelProps) {
  const handleBibtex = () => {
    const content = exportBibtex(papers, screening);
    downloadFile(content, 'aila_papers.bib', 'application/x-bibtex');
  };

  const handleMarkdown = () => {
    const content = exportMarkdown(papers, screening);
    downloadFile(content, 'aila_screening_result.md', 'text/markdown');
  };

  const handleReset = () => {
    if (confirm('确定要清除所有筛选数据吗？此操作不可撤销。')) {
      localStorage.removeItem('aila-paper-screener-state');
      window.location.reload();
    }
  };

  const counts = { relevant: 0, reference: 0, trash: 0 };
  Object.values(screening).forEach(a => {
    if (a.zone === 'relevant') counts.relevant++;
    else if (a.zone === 'reference') counts.reference++;
    else if (a.zone === 'trash') counts.trash++;
  });

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">
        {counts.relevant + counts.reference + counts.trash}/{papers.length}
      </span>
      <button
        onClick={handleBibtex}
        className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
      >
        BibTeX
      </button>
      <button
        onClick={handleMarkdown}
        className="px-2.5 py-1 text-xs font-medium bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
      >
        Markdown
      </button>
      <button
        onClick={handleReset}
        className="px-2 py-1 text-xs text-gray-400 hover:text-red-600 transition-colors"
        title="重置所有筛选数据"
      >
        重置
      </button>
    </div>
  );
}
