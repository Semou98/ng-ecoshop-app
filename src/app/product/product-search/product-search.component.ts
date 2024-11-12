import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Product } from '../../models/product.model';
import { ProductService } from '../product.service';
import { debounceTime, distinctUntilChanged, finalize, of, Subject, Subscription, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.css'
})
export class ProductSearchComponent implements OnInit, OnDestroy {
  @Output() searchResults = new EventEmitter<Product[]>();
  
  private searchTerms = new Subject<string>();
  private searchSubscription?: Subscription;
  
  searchTerm: string = '';
  isLoading = false;
  isError = false;
  
  constructor(private productService: ProductService) {}
  
  ngOnInit() {
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.isLoading = true;
        this.isError = false;
        return this.productService.searchProducts(term);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults.emit(results);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur de recherche:', error);
        this.isError = true;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    this.searchTerms.next(value);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchTerms.next('');
  }
}