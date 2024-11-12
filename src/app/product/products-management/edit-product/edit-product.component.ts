import { Component, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { ProductService } from '../../product.service';

@Component({
  selector: 'app-edit-product',
  template: `
    <div class="container mt-4">
      <div *ngIf="product$ | async as product; else loading">
        <div *ngIf="product; else notFound">
          <div class="text-center mb-4">
            <h2 class="eco-title">Modifier le produit : {{ product.title }}</h2>
          </div>
          <app-product-form [product]="product" [isEditForm]="true"></app-product-form>
        </div>
        <ng-template #notFound>
          <div class="alert alert-warning text-center">
            Produit non trouvé
          </div>
        </ng-template>
      </div>
      <ng-template #loading>
        <div class="text-center">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class EditProductComponent implements OnInit {
  product$!: Observable<Product | null>;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        return this.productService.getProductById(id);
      }),
      tap(product => {
        if (!product) {
          this.router.navigate(['/products/list']);
        }
      })
    );
  }
}