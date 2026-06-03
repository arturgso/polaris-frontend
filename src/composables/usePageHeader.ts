import { reactive } from 'vue';

export interface PageHeaderFilterItem {
  id: number;
  name: string;
  color?: string;
}

export interface PageHeaderFilter {
  title: string;
  items: PageHeaderFilterItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export interface PageHeaderState {
  title: string;
  subtitle: string;
  searchTerm: string;
  searchPlaceholder: string;
  hasSearch: boolean;
  filters: PageHeaderFilter[];
  hasActiveFilters: boolean;
  onSearchTermChange?: (value: string) => void;
  onClearFilters?: () => void;
}

export interface PageHeaderConfig {
  title: string;
  subtitle?: string;
  searchTerm?: string;
  searchPlaceholder?: string;
  filters?: PageHeaderFilter[];
  hasActiveFilters?: boolean;
  onSearchTermChange?: (value: string) => void;
  onClearFilters?: () => void;
}

const defaultHeaderState: PageHeaderState = {
  title: '',
  subtitle: '',
  searchTerm: '',
  searchPlaceholder: 'Pesquisar',
  hasSearch: false,
  filters: [],
  hasActiveFilters: false,
  onSearchTermChange: undefined,
  onClearFilters: undefined,
};

const pageHeaderState = reactive<PageHeaderState>({ ...defaultHeaderState });

export function usePageHeader() {
  function setPageHeader(config: PageHeaderConfig) {
    pageHeaderState.title = config.title;
    pageHeaderState.subtitle = config.subtitle ?? '';
    pageHeaderState.searchTerm = config.searchTerm ?? '';
    pageHeaderState.searchPlaceholder = config.searchPlaceholder ?? 'Pesquisar';
    pageHeaderState.hasSearch = config.searchTerm !== undefined;
    pageHeaderState.filters = config.filters ?? [];
    pageHeaderState.hasActiveFilters = config.hasActiveFilters ?? false;
    pageHeaderState.onSearchTermChange = config.onSearchTermChange;
    pageHeaderState.onClearFilters = config.onClearFilters;
  }

  function resetPageHeader() {
    Object.assign(pageHeaderState, defaultHeaderState);
  }

  return {
    pageHeaderState,
    resetPageHeader,
    setPageHeader,
  };
}
