import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListComponent } from './product-list/product-list.component';
import { RouterModule, Routes } from '@angular/router';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import { ProductCartComponent } from './product-cart/product-cart.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductSearchComponent } from './product-search/product-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EditProductComponent } from './products-management/edit-product/edit-product.component';
import { AddProductComponent } from './products-management/add-product/add-product.component';
import { ProductFormComponent } from './products-management/product-form/product-form.component';
import { CategoryModule } from '../category/category.module';


const productRoutes : Routes = [
  { path: 'list', component: ProductListComponent },
  { path: 'cart', component: ProductCartComponent },
  { path: 'create', component: AddProductComponent },
  { path: 'details/:id', component: ProductDetailsComponent },
  { path: 'edit/:id', component: EditProductComponent }
]

@NgModule({
  declarations: [
    ProductListComponent,
    ProductFilterComponent,
    ProductCartComponent,
    ProductDetailsComponent,
    ProductSearchComponent,
    EditProductComponent,
    AddProductComponent,
    ProductFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(productRoutes),
    ReactiveFormsModule,
    CategoryModule
  ],
  exports: [
    RouterModule
  ]
})
export class ProductModule { }
