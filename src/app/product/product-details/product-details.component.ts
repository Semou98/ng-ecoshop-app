import { Component } from '@angular/core';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { catchError, Observable, switchMap, tap } from 'rxjs';
import { CartService } from '../../cart/cart.service';
import { NotificationService } from '../../notification.service';

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
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService
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
    this.cartService.addToCart(product);
    this.notificationService.show('Produit ajouté au panier avec succès !');
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
