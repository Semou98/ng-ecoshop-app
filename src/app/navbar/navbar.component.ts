import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from '../cart/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  cartItemCount: number = 0;
  private subscription: Subscription;
  
  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.subscription = this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((count, item) => count + item.quantity, 0);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  
  createCategorie(){}

  goToCategorie(){}

  logout(){}
}
