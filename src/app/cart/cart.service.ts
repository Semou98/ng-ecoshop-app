import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '../models/product.model';
import { CartItem } from '../interfaces/cart-item.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItems = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItems.asObservable();
  
  constructor() {
    // Initialiser avec les données du localStorage
    this.cartItems.next(this.getStoredItems());
  }

  // Getter qui récupère les items du localStorage
  private getStoredItems(): CartItem[] {
    const storedCart = localStorage.getItem('cart');
    console.log("Stored cart "+ JSON.stringify(storedCart));
    return storedCart ? JSON.parse(storedCart) : [];
  }

  // Mise à jour du localStorage
  private updateStorage(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItems.next(items); // Émettre les nouvelles données
  }

  getCartItems(): CartItem[] {
    //return this.getStoredItems();
    return this.cartItems.value;
  }

  getCartTotal(): number {
    return this.cartItems.value.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  }

  addToCart(product: Product): void {
    const items = this.getStoredItems();
    console.log('Current items:', items);
    
    const existingItem = items.find(item => item.product.id === product.id);
  
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({ product, quantity: 1 });
    }
    
    console.log('Updated items:', items);
    this.updateStorage(items);
  }

  removeFromCart(productId: number): void {
    const items = this.getStoredItems().filter(item => 
      item.product.id !== productId);
    this.updateStorage(items);
  }

  updateQuantity(productId: number, quantity: number): void {
    const items = this.getStoredItems();
    const item = items.find(item => item.product.id === productId);
    
    if (item) {
      item.quantity = Math.max(1, quantity); // Minimum 1 produit
      this.updateStorage(items);
    }
  }

  clearCart(): void {
    localStorage.removeItem('cart');
  }

  getCartCount(): number {
    return this.getStoredItems().reduce((count, item) => 
      count + item.quantity, 0);
  }
}