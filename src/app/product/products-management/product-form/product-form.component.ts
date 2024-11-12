import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../product.service';
import { CategoryService } from '../../../category/category.service';
import { Router } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {

  @Input() product?: Product;
  @Input() isEditForm = false;
  productForm!: FormGroup;
  categories: string[] = [];
  imagePreview: string = '';
  isSubmitting = false;
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    if (this.isEditForm && this.product) {
      this.loadProduct(this.product);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      image: ['', Validators.required]
    });

    // Prévisualisation de l'image
    this.productForm.get('image')?.valueChanges.subscribe(url => {
      this.imagePreview = url;
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(
      categories => this.categories = categories
    );
  }

  loadProduct(product: Product): void {
    this.productForm.patchValue({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      image: product.image
    });
    this.imagePreview = product.image;
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.productForm.value;
      const productData: Partial<Product> = {
        title: formData.title,
        price: Number(formData.price), // Assurez-vous que le prix est un nombre
        description: formData.description,
        category: formData.category,
        image: formData.image
      };

      const action$ = this.isEditForm && this.product
        ? this.productService.updateProduct(this.product.id, productData)
        : this.productService.createProduct(productData);

      action$.pipe(
        finalize(() => this.isSubmitting = false)
      ).subscribe({
        next: (result) => {
          // Navigation après succès
          this.router.navigate(['/products/list']);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.isSubmitting = false;
        }
      });
    }
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.productService.createProduct(product);
  }

  updateProduct(id: string | number, product: Partial<Product>): Observable<Product> {
    return this.productService.updateProduct(id, product);
  }
}
