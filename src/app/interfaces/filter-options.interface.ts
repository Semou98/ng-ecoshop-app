export interface FilterOptions {
    category?: string[] | null;
    sort?: 'asc' | 'desc' | null;
    priceRange?: {
      min: number;
      max: number;
    };
}