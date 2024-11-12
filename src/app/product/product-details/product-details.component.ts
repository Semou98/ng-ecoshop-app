import { Component } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { catchError, Observable, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {

  product$: Observable<Product | null>;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {
    this.product$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.productService.getProductById(id!);
      }),
      tap(() => this.loading = false),
      catchError(error => {
        console.error('Erreur lors du chargement du produit:', error);
        this.router.navigate(['/products']);
        return [];
      })
    );
  }

  onAddToCart(product: Product) {
    // Implémenter la logique d'ajout au panier
  }

  onEditProduct(productId: number) {
    this.router.navigate(['/products/edit', productId]);
  }

  onDeleteProduct(productId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }
}
