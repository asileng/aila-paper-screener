import type { FilterState, Paper } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  papers: Paper[];
}

export function FilterBar({ filters, onChange, papers }: FilterBarProps) {
  const years = papers.map(p => p.Year).filter(y => y > 0);
  const minYear = Math.min(...years, 2000);
  const maxYear = Math.max(...years, 2025);
  const topics = [...new Set(papers.map(p => p.Topic).filter(Boolean))].sort();
  const sources = [...new Set(papers.map(p => p.Source).filter(Boolean))].sort();

  const update = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {/* Year range */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-500">年份</span>
        <input
          type="number"
          min={minYear}
          max={maxYear}
          value={filters.yearRange[0]}
          onChange={e => update({ yearRange: [+e.target.value, filters.yearRange[1]] })}
          className="w-14 px-1.5 py-1 border border-gray-200 rounded text-center"
        />
        <span className="text-gray-400">–</span>
        <input
          type="number"
          min={minYear}
          max={maxYear}
          value={filters.yearRange[1]}
          onChange={e => update({ yearRange: [filters.yearRange[0], +e.target.value] })}
          className="w-14 px-1.5 py-1 border border-gray-200 rounded text-center"
        />
      </div>

      {/* Topic */}
      <select
        multiple={false}
        value={filters.topics[0] || ''}
        onChange={e => update({ topics: e.target.value ? [e.target.value] : [] })}
        className="px-2 py-1 border border-gray-200 rounded bg-white max-w-48 truncate"
      >
        <option value="">全部主题</option>
        {topics.map(t => (
          <option key={t} value={t}>{t.length > 40 ? t.slice(0, 37) + '...' : t}</option>
        ))}
      </select>

      {/* OA only */}
      <label className="flex items-center gap-1 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.oaOnly}
          onChange={e => update({ oaOnly: e.target.checked })}
          className="rounded"
        />
        <span className="text-gray-600">仅OA</span>
      </label>

      {/* Citation min */}
      <div className="flex items-center gap-1.5">
        <span className="text-gray-500">引用≥</span>
        <input
          type="number"
          min={0}
          value={filters.citationMin}
          onChange={e => update({ citationMin: +e.target.value })}
          className="w-14 px-1.5 py-1 border border-gray-200 rounded text-center"
        />
      </div>

      {/* Source */}
      <select
        value={filters.sources[0] || ''}
        onChange={e => update({ sources: e.target.value ? [e.target.value] : [] })}
        className="px-2 py-1 border border-gray-200 rounded bg-white"
      >
        <option value="">全部来源</option>
        {sources.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Venue/title search */}
      <input
        type="text"
        placeholder="搜索标题/期刊..."
        value={filters.venueSearch}
        onChange={e => update({ venueSearch: e.target.value })}
        className="px-2 py-1 border border-gray-200 rounded w-40"
      />

      {/* Reset */}
      <button
        onClick={() => onChange({
          yearRange: [minYear, maxYear],
          topics: [],
          oaOnly: false,
          citationMin: 0,
          sources: [],
          venueSearch: '',
        })}
        className="px-2 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
      >
        重置
      </button>
    </div>
  );
}
