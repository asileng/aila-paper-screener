import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md';
}

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const sz = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`${sz} cursor-pointer transition-colors ${
            n <= (hover || value) ? 'text-amber-400' : 'text-gray-300'
          } hover:text-amber-400`}
          onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
