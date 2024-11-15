export interface FilterOptions {
  sort?: 'asc' | 'desc' | null;
  category?: string[] | null;  // Changé pour supporter multiple catégories
  priceRange?: { 
    min: number; 
    max: number;
    current?: { min: number; max: number; };  // Changé pour supporter le current price range
  };
}