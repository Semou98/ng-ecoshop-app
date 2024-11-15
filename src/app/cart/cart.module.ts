import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart/cart.component';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartSummaryComponent } from './cart-summary/cart-summary.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

const cartRoutes: Routes = [
  { path: '', component: CartComponent },

  // Page de confirmation de commande distincte :
  //{ path: 'cart/checkout', component: CheckoutComponent },
];

@NgModule({
  declarations: [
    CartComponent,
    CartItemComponent,
    CartSummaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(cartRoutes)
  ],
  exports: [
    RouterModule,
    CartItemComponent
  ]
})
export class CartModule { }
