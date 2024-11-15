import { Component, Input } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, finalize, map, Observable, of, startWith, Subject, take, takeUntil, tap } from 'rxjs';
import { FilterOptions } from '../../models/filter-options';
import { CartService } from '../../cart/cart.service';
import { NotificationService } from '../../notification.service';


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

  viewModel$: Observable<ProductListViewModel>;
  private destroy$ = new Subject<void>();

  products$: Observable<Product[]>;
  @Input() product!: Product;
  filteredProducts: Product[] = [];
  loading = false;
  
  private searchResultsSubject = new BehaviorSubject<Product[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);
  
  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {
    this.viewModel$ = this.initViewModel();
  }

  private initViewModel(): Observable<ProductListViewModel> {
    return combineLatest([
      this.productService.getAllProducts(),
      this.productService.getAllCategories()
    ]).pipe(
      map(([products, categories]) => ({
        loading: false,
        products,
        filteredProducts: products,
        categories,
        searchResults: products
      })),
      startWith({
        loading: true,
        products: [],
        filteredProducts: [],
        categories: [],
        searchResults: []
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des produits:', error);
        return [{ 
          loading: false,
          products: [],
          filteredProducts: [],
          categories: [],
          searchResults: []
        }];
      }),
      takeUntil(this.destroy$)
    );
  }

  onFilterChange(filters: FilterOptions) {
    this.viewModel$ = this.viewModel$.pipe(
      map(vm => ({
        ...vm,
        filteredProducts: this.applyFilters(vm.products, filters)
      }))
    );
  }

  private applyFilters(products: Product[], filters: FilterOptions): Product[] {
    let filtered = [...products];

    // Filtre par catégorie
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.category?.includes(product.category)
      );
    }

    // Filtre par prix
    filtered = filtered.filter(product => 
      product.price >= (filters.priceRange?.min || 0) && 
      product.price <= (filters.priceRange?.max || Infinity)
    );

    // Tri par prix
    if (filters.sort) {
      filtered = filtered.sort((a, b) => 
        filters.sort === 'asc' ? a.price - b.price : b.price - a.price
      );
    }

    return filtered;
  }

  onSearchResults(results: Product[]) {
    this.viewModel$ = this.viewModel$.pipe(
      map(vm => ({...vm, searchResults: results}))
    );
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
