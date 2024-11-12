import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-cart',
  templateUrl: './product-cart.component.html',
  styleUrl: './product-cart.component.css'
})
export class ProductCartComponent {

  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();

  constructor(
    private router: Router
  ){}

  onAddToCart() {
    this.addToCart.emit(this.product);
  }

  navigateToProductDetails() {
    this.router.navigate(['/products/details', this.product.id]);
  }
}
