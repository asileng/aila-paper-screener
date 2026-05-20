import { useDraggable } from '@dnd-kit/core';
import type { Paper, PaperAssignment, Zone } from '../types';

interface PaperCardProps {
  paper: Paper;
  assignment: PaperAssignment;
  isSelected: boolean;
  viewMode: 'compact' | 'detail';
  onClick: () => void;
  isInZone?: boolean;
}

const zoneColors: Record<Zone, string> = {
  trash: 'border-l-red-400',
  relevant: 'border-l-emerald-400',
  reference: 'border-l-blue-400',
};

export function PaperCard({ paper, assignment, isSelected, viewMode, onClick, isInZone }: PaperCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: paper.id,
    data: { paper, fromZone: assignment.zone },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const borderClass = assignment.zone ? zoneColors[assignment.zone] : 'border-l-transparent';
  const stars = assignment.rating > 0 ? '★'.repeat(assignment.rating) + '☆'.repeat(5 - assignment.rating) : '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        border-l-[3px] ${borderClass} px-3 py-2 cursor-pointer select-none transition-colors
        ${isSelected ? 'bg-blue-50 ring-1 ring-blue-300' : 'bg-white hover:bg-gray-50'}
        ${isDragging ? 'opacity-50 shadow-lg z-50' : ''}
        ${isInZone ? 'rounded-md shadow-sm mb-1' : 'border-b border-b-gray-100'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={`font-medium leading-snug ${viewMode === 'compact' ? 'text-xs truncate' : 'text-sm'}`}>
            {paper.Title}
          </p>
          {viewMode === 'detail' && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{paper.Authors}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <span>{paper.Year}</span>
            {paper.CitedBy > 0 && <span>引用 {paper.CitedBy}</span>}
            {paper.Source && <span className="text-gray-300">{paper.Source}</span>}
            {paper.Topic && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-gray-100 text-gray-500 truncate max-w-32">
                {paper.Topic}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {stars && <span className="text-amber-400 text-xs tracking-tight">{stars}</span>}
          {assignment.tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 justify-end">
              {assignment.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-600">
                  {tag}
                </span>
              ))}
              {assignment.tags.length > 3 && (
                <span className="text-[10px] text-gray-400">+{assignment.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
