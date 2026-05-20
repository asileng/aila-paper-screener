import { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import type { Paper, FilterState, Zone } from './types';
import { normalizePaper } from './utils/normalize';
import { filterPapers } from './utils/filter';
import { useScreening } from './store';
import { FilterBar } from './components/FilterBar';
import { PaperList } from './components/PaperList';
import { PaperDetail } from './components/PaperDetail';
import { DropZone } from './components/DropZone';
import { ViewToggle } from './components/ViewToggle';
import { ExportPanel } from './components/ExportPanel';

const ZONE_KEYS: Record<string, Zone> = { '1': 'trash', '2': 'relevant', '3': 'reference' };

function App() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'compact' | 'detail'>('compact');
  const [draggedPaper, setDraggedPaper] = useState<Paper | null>(null);
  const [collapsed, setCollapsed] = useState<Record<Zone, boolean>>({ trash: false, relevant: false, reference: false });
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    yearRange: [2000, 2025],
    topics: [],
    oaOnly: false,
    citationMin: 0,
    sources: [],
    venueSearch: '',
  });

  const { screening, dispatch, getAssignment } = useScreening();
  const listRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetch('/papers.json')
      .then(r => r.json())
      .then((data: Record<string, unknown>[]) => {
        const normalized = data.map((p, i) => normalizePaper(p, i));
        setPapers(normalized);
        const years = normalized.map(p => p.Year).filter(y => y > 0);
        setFilters(f => ({
          ...f,
          yearRange: [Math.min(...years, 2000), Math.max(...years, 2025)],
        }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterPapers(papers, filters);

  const zonedPapers = useCallback((zone: Zone) => {
    return papers.filter(p => {
      const a = screening[p.id];
      return a && a.zone === zone;
    });
  }, [papers, screening]);

  const unzonedPapers = filtered.filter(p => {
    const a = screening[p.id];
    return !a || !a.zone;
  });

  const displayPapers = showAll ? filtered : unzonedPapers;

  const selectedPaper = papers.find(p => p.id === selectedId) || null;
  const selectedAssignment = selectedId ? getAssignment(selectedId) : { zone: null, tags: [], rating: 0, notes: '' };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = displayPapers.findIndex(p => p.id === selectedId);
        const next = e.key === 'ArrowDown'
          ? Math.min(idx + 1, displayPapers.length - 1)
          : Math.max(idx - 1, 0);
        if (displayPapers[next]) setSelectedId(displayPapers[next].id);
      } else if (e.key in ZONE_KEYS && selectedId) {
        e.preventDefault();
        const zone = ZONE_KEYS[e.key];
        const current = screening[selectedId]?.zone;
        dispatch({ type: 'ASSIGN_ZONE', paperId: selectedId, zone: current === zone ? null : zone });
        // Auto-advance to next paper
        const idx = displayPapers.findIndex(p => p.id === selectedId);
        if (idx < displayPapers.length - 1) setSelectedId(displayPapers[idx + 1].id);
      } else if (e.key === '0' && selectedId) {
        e.preventDefault();
        dispatch({ type: 'ASSIGN_ZONE', paperId: selectedId, zone: null });
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedId, displayPapers, screening, dispatch]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const paper = papers.find(p => p.id === id);
    if (paper) setDraggedPaper(paper);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedPaper(null);
    const { active, over } = event;
    if (!over) return;

    const paperId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('zone-')) {
      const zone = overId.replace('zone-', '') as Zone;
      dispatch({ type: 'ASSIGN_ZONE', paperId, zone });
    }
  };

  const handleAssignZone = (zone: Zone | null) => {
    if (selectedId) {
      dispatch({ type: 'ASSIGN_ZONE', paperId: selectedId, zone });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        加载论文数据...
      </div>
    );
  }

  const screenedCount = Object.values(screening).filter(a => a.zone).length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
          <h1 className="text-sm font-semibold text-gray-800 shrink-0">AILA 论文筛选</h1>
          <FilterBar filters={filters} onChange={setFilters} papers={papers} />
          <div className="flex items-center gap-2.5 shrink-0">
            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <ExportPanel papers={papers} screening={screening} />
          </div>
        </header>

        {/* Main content: list + detail */}
        <div className="flex flex-1 min-h-0">
          {/* Paper list */}
          <div className="w-2/5 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
            <div className="px-3 py-1.5 text-xs text-gray-500 border-b border-gray-100 flex items-center justify-between">
              <span>{displayPapers.length} 篇{showAll ? '匹配' : '未筛选'} / 共 {papers.length} 篇</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={e => setShowAll(e.target.checked)}
                    className="size-3"
                  />
                  <span>显示已筛选</span>
                </label>
                <span className="text-gray-400">已筛 {screenedCount}</span>
              </div>
            </div>
            <div ref={listRef} className="flex-1 overflow-hidden">
              <PaperList
                papers={displayPapers}
                getAssignment={getAssignment}
                selectedId={selectedId}
                onSelect={setSelectedId}
                viewMode={viewMode}
              />
            </div>
          </div>

          {/* Detail panel */}
          <div className="w-3/5 bg-white overflow-hidden">
            <PaperDetail
              paper={selectedPaper}
              assignment={selectedAssignment}
              onAssignZone={handleAssignZone}
              onSetRating={rating => selectedId && dispatch({ type: 'SET_RATING', paperId: selectedId, rating })}
              onSetTags={tags => selectedId && dispatch({ type: 'SET_TAGS', paperId: selectedId, tags })}
              onSetNotes={notes => selectedId && dispatch({ type: 'SET_NOTES', paperId: selectedId, notes })}
            />
          </div>
        </div>

        {/* Bottom zones */}
        <div className="flex gap-3 px-4 py-3 bg-gray-100 border-t border-gray-200">
          {(['trash', 'relevant', 'reference'] as Zone[]).map((zone, i) => (
            <div key={zone} className="flex-1">
              <DropZone
                zone={zone}
                papers={zonedPapers(zone)}
                getAssignment={getAssignment}
                selectedId={selectedId}
                onSelect={setSelectedId}
                collapsed={collapsed[zone]}
                onToggle={() => setCollapsed(c => ({ ...c, [zone]: !c[zone] }))}
              />
            </div>
          ))}
        </div>

        {/* Keyboard shortcut hint */}
        <div className="px-4 py-1 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex gap-4">
          <span>↑↓ 导航</span>
          <span>1 垃圾区</span>
          <span>2 高相关</span>
          <span>3 参考区</span>
          <span>0 取消分配</span>
          <span>Esc 取消选中</span>
        </div>
      </div>

      <DragOverlay>
        {draggedPaper && (
          <div className="bg-white shadow-lg rounded-md px-3 py-2 border border-blue-300 max-w-xs opacity-90">
            <p className="text-xs font-medium truncate">{draggedPaper.Title}</p>
            <p className="text-[10px] text-gray-400">{draggedPaper.Year} · {draggedPaper.Authors.split(';')[0]}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
