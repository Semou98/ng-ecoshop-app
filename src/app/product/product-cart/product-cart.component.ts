import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { CartService } from '../../cart/cart.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrl: './product-cart.component.css'
})
export class ProductCartComponent {

  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  constructor(
    private router: Router,
    private cartService: CartService,
    private notificationService: NotificationService
  ){}

  onAddToCart() {
    this.cartService.addToCart(this.product);
    this.addToCart.emit(this.product);
    this.notificationService.show('Produit ajouté au panier avec succès !');
  }

  navigateToProductDetails() {
    this.router.navigate(['/products/details', this.product.id]);
  }
}
