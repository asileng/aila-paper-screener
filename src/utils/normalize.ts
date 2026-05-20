import type { Paper } from '../types';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function normalizePaper(raw: Record<string, unknown>, index: number): Paper {
  const year = typeof raw.Year === 'number' ? raw.Year : parseInt(String(raw.Year), 10);
  const title = String(raw.Title || '');
  const id = title ? `p-${hashCode(title)}` : `p-${index}`;

  return {
    id,
    Topic: String(raw.Topic || ''),
    Title: title,
    Year: isNaN(year) ? 0 : year,
    Authors: String(raw.Authors || ''),
    Venue: String(raw.Venue || ''),
    CitedBy: typeof raw.CitedBy === 'number' ? raw.CitedBy : parseInt(String(raw.CitedBy), 10) || 0,
    OA: Boolean(raw.OA),
    OA_URL: String(raw.OA_URL || ''),
    DOI: String(raw.DOI || ''),
    ArXivID: String(raw.ArXivID || ''),
    Abstract: String(raw.Abstract || ''),
    Source: String(raw.Source || ''),
  };
}
