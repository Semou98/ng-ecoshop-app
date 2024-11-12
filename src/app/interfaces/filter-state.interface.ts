export interface FilterState {
    categories: {
      list: string[];
      selected: string[];
    };
    priceRange: {
      min: number;
      max: number;
      current: { min: number; max: number; }
    };
    sort: 'asc' | 'desc' | null;
    currentPage: number;
    itemsPerPage: number;
}