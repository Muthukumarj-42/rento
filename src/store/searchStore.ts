import { create } from 'zustand';
import { type SearchFilters } from '@/types';

interface SearchState {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const defaultFilters: SearchFilters = {
  city: 'Coimbatore',
  sortBy: 'newest',
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: defaultFilters,
  searchQuery: '',
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
