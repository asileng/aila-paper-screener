import type { Paper, FilterState } from '../types';

export function filterPapers(papers: Paper[], filters: FilterState): Paper[] {
  return papers.filter(p => {
    if (p.Year < filters.yearRange[0] || p.Year > filters.yearRange[1]) return false;
    if (filters.topics.length > 0 && !filters.topics.includes(p.Topic)) return false;
    if (filters.oaOnly && !p.OA) return false;
    if (p.CitedBy < filters.citationMin) return false;
    if (filters.sources.length > 0 && !filters.sources.includes(p.Source)) return false;
    if (filters.venueSearch) {
      const q = filters.venueSearch.toLowerCase();
      if (!p.Venue.toLowerCase().includes(q) && !p.Title.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
