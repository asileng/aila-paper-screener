import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { ScreeningState, Action, PaperAssignment } from './types';

const STORAGE_KEY = 'aila-paper-screener-state';

function loadScreening(): ScreeningState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveScreening(state: ScreeningState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const defaultAssignment: PaperAssignment = { zone: null, tags: [], rating: 0, notes: '' };

function screeningReducer(state: ScreeningState, action: Action): ScreeningState {
  switch (action.type) {
    case 'ASSIGN_ZONE': {
      const existing = state[action.paperId] || defaultAssignment;
      return { ...state, [action.paperId]: { ...existing, zone: action.zone } };
    }
    case 'SET_TAGS': {
      const existing = state[action.paperId] || defaultAssignment;
      return { ...state, [action.paperId]: { ...existing, tags: action.tags } };
    }
    case 'SET_RATING': {
      const existing = state[action.paperId] || defaultAssignment;
      return { ...state, [action.paperId]: { ...existing, rating: action.rating } };
    }
    case 'SET_NOTES': {
      const existing = state[action.paperId] || defaultAssignment;
      return { ...state, [action.paperId]: { ...existing, notes: action.notes } };
    }
    case 'LOAD_SCREENING':
      return action.screening;
    case 'RESET':
      return {};
    default:
      return state;
  }
}

interface ScreeningContextValue {
  screening: ScreeningState;
  dispatch: React.Dispatch<Action>;
  getAssignment: (paperId: string) => PaperAssignment;
}

const ScreeningContext = createContext<ScreeningContextValue | null>(null);

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [screening, dispatch] = useReducer(screeningReducer, null, loadScreening);

  useEffect(() => {
    saveScreening(screening);
  }, [screening]);

  const getAssignment = (paperId: string): PaperAssignment => {
    return screening[paperId] || defaultAssignment;
  };

  return (
    <ScreeningContext.Provider value={{ screening, dispatch, getAssignment }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const ctx = useContext(ScreeningContext);
  if (!ctx) throw new Error('useScreening must be used within ScreeningProvider');
  return ctx;
}
