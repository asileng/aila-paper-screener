import { useDroppable } from '@dnd-kit/core';
import type { Paper, PaperAssignment, Zone } from '../types';
import { PaperCard } from './PaperCard';

interface DropZoneProps {
  zone: Zone;
  papers: Paper[];
  getAssignment: (id: string) => PaperAssignment;
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const zoneConfig: Record<Zone, { border: string; header: string; bg: string }> = {
  trash: { border: 'border-red-200', header: 'bg-red-50 text-red-700', bg: 'bg-red-50/30' },
  relevant: { border: 'border-emerald-200', header: 'bg-emerald-50 text-emerald-700', bg: 'bg-emerald-50/30' },
  reference: { border: 'border-blue-200', header: 'bg-blue-50 text-blue-700', bg: 'bg-blue-50/30' },
};

const zoneLabels: Record<Zone, string> = {
  trash: '垃圾区',
  relevant: '高相关区',
  reference: '参考区',
};

export function DropZone({ zone, papers, getAssignment, selectedId, onSelect, collapsed, onToggle }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id: `zone-${zone}` });
  const cfg = zoneConfig[zone];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border ${cfg.border} transition-colors ${
        isOver ? 'ring-2 ring-offset-1 ring-gray-400' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-t-lg ${cfg.header} text-xs font-medium`}
      >
        <span>{zoneLabels[zone]}</span>
        <span className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded-full bg-white/60 text-[10px]">{papers.length}</span>
          <span>{collapsed ? '▶' : '▼'}</span>
        </span>
      </button>

      {!collapsed && (
        <div className={`min-h-[80px] max-h-[200px] overflow-y-auto p-1.5 ${cfg.bg} rounded-b-lg`}>
          {papers.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">拖拽论文到此处</p>
          ) : (
            papers.map(paper => (
              <PaperCard
                key={paper.id}
                paper={paper}
                assignment={getAssignment(paper.id)}
                isSelected={paper.id === selectedId}
                viewMode="compact"
                onClick={() => onSelect(paper.id)}
                isInZone
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
