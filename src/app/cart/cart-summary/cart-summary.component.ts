import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cart-summary',
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.css'
})
export class CartSummaryComponent {
  @Input() total: number;
  @Output() clearCart = new EventEmitter<void>();

  onClearCart(): void {
    this.clearCart.emit();
  }
}
