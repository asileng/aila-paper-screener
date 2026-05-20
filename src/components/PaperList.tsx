import type { Paper, PaperAssignment } from '../types';
import { PaperCard } from './PaperCard';

interface PaperListProps {
  papers: Paper[];
  getAssignment: (id: string) => PaperAssignment;
  selectedId: string | null;
  onSelect: (id: string) => void;
  viewMode: 'compact' | 'detail';
}

export function PaperList({ papers, getAssignment, selectedId, onSelect, viewMode }: PaperListProps) {
  if (papers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        没有匹配的论文
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {papers.map(paper => (
        <PaperCard
          key={paper.id}
          paper={paper}
          assignment={getAssignment(paper.id)}
          isSelected={paper.id === selectedId}
          viewMode={viewMode}
          onClick={() => onSelect(paper.id)}
        />
      ))}
    </div>
  );
}
