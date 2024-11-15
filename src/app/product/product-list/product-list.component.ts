import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, finalize, map, Observable, of, startWith, Subject, take, takeUntil, tap } from 'rxjs';
import { CartService } from '../../cart/cart.service';
import { NotificationService } from '../../notification.service';
import { FilterOptions } from '../../interfaces/filter-options.interface';

/*interface ViewModel {
  loading: boolean;
  products: Product[];
  filteredProducts: Product[];
}*/

export interface ProductListViewModel {
  loading: boolean;
  products: Product[];
  filteredProducts: Product[];
  categories: string[];
  searchResults?: Product[];
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {

  private viewModelSubject = new BehaviorSubject<ProductListViewModel>({
    loading: true,
    products: [],
    filteredProducts: [],
    categories: [],
    searchResults: []
  });

  viewModel$ = this.viewModelSubject.asObservable();
  private destroy$ = new Subject<void>();
  
  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.initViewModel();
  }

  private initViewModel(): void {
    combineLatest([
      this.productService.getAllProducts(),
      this.productService.getAllCategories()
    ]).pipe(
      takeUntil(this.destroy$),
      map(([products, categories]) => {
        const savedFilters = localStorage.getItem('currentFilters');
        let filteredProducts = products;
        
        if (savedFilters) {
          const filters = JSON.parse(savedFilters);
          filteredProducts = this.applyFilters(products, filters);
        }

        return {
          loading: false,
          products,
          filteredProducts,
          categories,
          searchResults: []
        };
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des produits:', error);
        return of({
          loading: false,
          products: [],
          filteredProducts: [],
          categories: [],
          searchResults: []
        });
      })
    ).subscribe(viewModel => {
      this.viewModelSubject.next(viewModel);
    });
  }

  onFilterChange(filters: FilterOptions) {
    console.log('Filters received:', filters);
    localStorage.setItem('currentFilters', JSON.stringify(filters));
    
    const currentViewModel = this.viewModelSubject.value;
    const filteredProducts = this.applyFilters(currentViewModel.products, filters);
    
    this.viewModelSubject.next({
      ...currentViewModel,
      loading: false,
      filteredProducts
    });
  }

  private applyFilters(products: Product[], filters: FilterOptions): Product[] {
    let filtered = [...products];

    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.category?.includes(product.category)
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange!.min && 
        product.price <= filters.priceRange!.max
      );
    }

    if (filters.sort) {
      filtered = filtered.sort((a, b) => 
        filters.sort === 'asc' ? a.price - b.price : b.price - a.price
      );
    }

    return filtered;
  }

  onSearchResults(results: Product[]) {
    const currentViewModel = this.viewModelSubject.value;
    this.viewModelSubject.next({
      ...currentViewModel,
      searchResults: results,
      loading: false
    });
  }

  onAddToCart(product: Product) {
    this.cartService.addToCart(product);
    this.notificationService.show('Produit ajouté au panier avec succès !');
  }

  onCreateProduct() {
    this.router.navigate(['/products/create']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
