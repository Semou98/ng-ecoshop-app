import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { FilterOptions } from '../../interfaces/filter-options.interface';
import { FilterState } from '../../interfaces/filter-state.interface';
import { ProductService } from '../product.service';


@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.css']
})
export class ProductFilterComponent implements OnInit {

  @Output() filterChange = new EventEmitter<any>();
  private destroy$ = new Subject<void>();
  
  isLoading = {
    categories: false
  };

  filterState: FilterState = {
    categories: {
      list: [],
      selected: []
    },
    priceRange: {
      min: 0,
      max: 5000,
      current: { min: 0, max: 5000 }
    },
    sort: null,
    currentPage: 1,
    itemsPerPage: 5
  };

  loading$ = this.productService.getLoadingState();

  constructor(
    private productService: ProductService,
  ) {}

  ngOnInit() {
    this.productService.getAllCategories()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (categories) => {
        this.filterState.categories.list = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    })  
  }
  
  onCategoryChange(category: string) {
    const selected = [...this.filterState.categories.selected];
    const index = selected.indexOf(category);
    
    if (index === -1) {
      selected.push(category);
    } else {
      selected.splice(index, 1);
    }
  
    this.filterState = {
      ...this.filterState,
      categories: {
        ...this.filterState.categories,
        selected
      }
    };
  
    this.updateFilters();
  }

  onPriceRangeChange(event: any, bound: 'min' | 'max') {
    this.filterState.priceRange.current[bound] = Number(event.target.value);
    this.updateFilters();
  }

  onSortChange(direction: 'asc' | 'desc' | null) {
    this.filterState.sort = direction;
    this.updateFilters();
  }

  onPageChange(page: number) {
    this.filterState.currentPage = page;
  }

  resetFilters() {
    this.filterState = {
      ...this.filterState,
      categories: {
        ...this.filterState.categories,
        selected: []
      },
      priceRange: {
        ...this.filterState.priceRange,
        current: { min: this.filterState.priceRange.min, max: this.filterState.priceRange.max }
      },
      sort: null,
      currentPage: 1
    };
    this.updateFilters();
  }

  private updateFilters() {
    const filters: FilterOptions = {
      category: this.filterState.categories.selected.length > 0 ? this.filterState.categories.selected : null,
      sort: this.filterState.sort,
      priceRange: {
        min: this.filterState.priceRange.current.min,
        max: this.filterState.priceRange.current.max
      }
    };
    console.log('Filters emitted:', filters);
    this.filterChange.emit(filters);
  }
  
  get paginatedCategories() {
    const start = (this.filterState.currentPage - 1) * this.filterState.itemsPerPage;
    const end = start + this.filterState.itemsPerPage;
    return this.filterState.categories.list.slice(start, end);
  }

  get totalPages() {
    return Math.ceil(this.filterState.categories.list.length / this.filterState.itemsPerPage);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}