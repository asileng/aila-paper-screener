interface ViewToggleProps {
  mode: 'compact' | 'detail';
  onChange: (mode: 'compact' | 'detail') => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
      <button
        onClick={() => onChange('compact')}
        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
          mode === 'compact' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        简洁
      </button>
      <button
        onClick={() => onChange('detail')}
        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
          mode === 'detail' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        详情
      </button>
    </div>
  );
}
