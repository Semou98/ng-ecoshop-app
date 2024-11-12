import { Component } from '@angular/core';

@Component({
  selector: 'app-add-product',
  template: `
    <div class="container mt-4">
      <div class="text-center mb-4">
        <h2 class="eco-title">Ajouter un nouveau produit</h2>
      </div>
      <app-product-form [isEditForm]="false"></app-product-form>
    </div>
  `
})
export class AddProductComponent {

}
