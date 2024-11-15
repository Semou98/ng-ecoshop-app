import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CartItem } from '../../interfaces/cart-item.interface';

@Component({
  selector: 'app-cart-item',
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent {
  @Input() item: CartItem;
  @Output() removeItem = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<number>();

  onRemove(): void {
    this.removeItem.emit();
  }

  onQuantityChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const quantity = parseInt(target.value, 10);
    this.updateQuantity.emit(quantity);
  }
}
