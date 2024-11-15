import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';
import { CartService } from '../../cart/cart.service';

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
    private cartService: CartService
  ){}

  onAddToCart() {
    this.cartService.addToCart(this.product);
    this.addToCart.emit(this.product); // On garde l'émission pour la notification
  }

  navigateToProductDetails() {
    this.router.navigate(['/products/details', this.product.id]);
  }
}
