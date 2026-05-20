export interface Paper {
  id: string;
  Topic: string;
  Title: string;
  Year: number;
  Authors: string;
  Venue: string;
  CitedBy: number;
  OA: boolean;
  OA_URL: string;
  DOI: string;
  ArXivID: string;
  Abstract: string;
  Source: string;
}

export type Zone = 'trash' | 'relevant' | 'reference';

export interface PaperAssignment {
  zone: Zone | null;
  tags: string[];
  rating: number;
  notes: string;
}

export type ScreeningState = Record<string, PaperAssignment>;

export interface FilterState {
  yearRange: [number, number];
  topics: string[];
  oaOnly: boolean;
  citationMin: number;
  sources: string[];
  venueSearch: string;
}

export interface AppState {
  papers: Paper[];
  screening: ScreeningState;
  filters: FilterState;
  selectedPaperId: string | null;
  viewMode: 'compact' | 'detail';
}

export type Action =
  | { type: 'ASSIGN_ZONE'; paperId: string; zone: Zone | null }
  | { type: 'SET_TAGS'; paperId: string; tags: string[] }
  | { type: 'SET_RATING'; paperId: string; rating: number }
  | { type: 'SET_NOTES'; paperId: string; notes: string }
  | { type: 'LOAD_SCREENING'; screening: ScreeningState }
  | { type: 'RESET' };
