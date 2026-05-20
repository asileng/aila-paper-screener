import type { Paper, PaperAssignment, Zone } from '../types';
import { StarRating } from './StarRating';
import { TagInput } from './TagInput';

interface PaperDetailProps {
  paper: Paper | null;
  assignment: PaperAssignment;
  onAssignZone: (zone: Zone | null) => void;
  onSetRating: (rating: number) => void;
  onSetTags: (tags: string[]) => void;
  onSetNotes: (notes: string) => void;
}

export function PaperDetail({ paper, assignment, onAssignZone, onSetRating, onSetTags, onSetNotes }: PaperDetailProps) {
  if (!paper) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        点击左侧论文查看详情
      </div>
    );
  }

  const zoneButtons: { zone: Zone; label: string; color: string }[] = [
    { zone: 'relevant', label: '高相关区', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { zone: 'reference', label: '参考区', color: 'bg-blue-600 hover:bg-blue-700' },
    { zone: 'trash', label: '垃圾区', color: 'bg-red-600 hover:bg-red-700' },
  ];

  return (
    <div className="overflow-y-auto h-full p-4 space-y-4">
      {/* Title & metadata */}
      <div>
        <h2 className="text-base font-semibold leading-snug">{paper.Title}</h2>
        <p className="text-sm text-gray-600 mt-1">{paper.Authors}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span>{paper.Year}</span>
          {paper.Venue && <span className="text-gray-400">{paper.Venue}</span>}
          {paper.CitedBy > 0 && <span>被引 {paper.CitedBy}</span>}
          {paper.OA && <span className="text-emerald-600">OA</span>}
          {paper.Source && <span className="text-gray-300">{paper.Source}</span>}
        </div>
      </div>

      {/* Links */}
      {(paper.DOI || paper.OA_URL || paper.ArXivID) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {paper.DOI && (
            <a href={paper.DOI} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
              DOI
            </a>
          )}
          {paper.OA_URL && (
            <a href={paper.OA_URL} target="_blank" rel="noopener" className="text-emerald-600 hover:underline">
              全文
            </a>
          )}
          {paper.ArXivID && (
            <a href={`https://arxiv.org/abs/${paper.ArXivID}`} target="_blank" rel="noopener" className="text-orange-600 hover:underline">
              arXiv: {paper.ArXivID}
            </a>
          )}
        </div>
      )}

      {/* Abstract */}
      {paper.Abstract && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-1">摘要</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{paper.Abstract}</p>
        </div>
      )}

      {/* Topic */}
      {paper.Topic && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-1">主题</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{paper.Topic}</span>
        </div>
      )}

      {/* Rating */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-1">评分</h3>
        <StarRating value={assignment.rating} onChange={onSetRating} />
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-1">标签</h3>
        <TagInput tags={assignment.tags} onChange={onSetTags} />
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-1">备注</h3>
        <textarea
          value={assignment.notes}
          onChange={e => onSetNotes(e.target.value)}
          placeholder="添加备注..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Zone assignment buttons */}
      <div>
        <h3 className="text-xs font-medium text-gray-500 mb-2">分配区域</h3>
        <div className="flex gap-2">
          {zoneButtons.map(({ zone, label, color }) => (
            <button
              key={zone}
              onClick={() => onAssignZone(assignment.zone === zone ? null : zone)}
              className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
                assignment.zone === zone ? color + ' ring-2 ring-offset-1 ring-gray-400' : color
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {assignment.zone && (
          <button
            onClick={() => onAssignZone(null)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            取消分配
          </button>
        )}
      </div>
    </div>
  );
}
