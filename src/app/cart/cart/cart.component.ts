import { Component } from '@angular/core';
import { CartItem } from '../../interfaces/cart-item.interface';
import { CartService } from '../cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  private subscription: Subscription;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart(); // Charger le panier initialement
    
    // S'abonner aux changements du panier
    this.subscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.cartTotal = this.cartService.getCartTotal();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.cartTotal = this.cartService.getCartTotal();
  }

  onRemoveFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  onUpdateQuantity(productId: number, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  onClearCart(): void {
    this.cartService.clearCart();
  }
}
