import { Component } from '@angular/core';
import { ProductService } from './product/product.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ecoshop-app';

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.initialize().subscribe();
  }
}
