import { Component } from '@angular/core';
import { Product } from '../models/product.model';
import { interval, map, Subscription, takeWhile } from 'rxjs';
import { ProductService } from '../product/product.service';
import { Router } from '@angular/router';
declare var bootstrap: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  popularProducts: Product[] = [];
  private subscription: Subscription = new Subscription();
  isLoading = true;
  error: string | null = null;
  private carousel: any;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPopularProducts();
  }

  private loadPopularProducts(): void {
    this.subscription.add(
      this.productService.getAllProducts()
        .pipe(
          map(products => {
            return products
              .sort((a, b) => {
                const popularityA = a.rating.rate * a.rating.count;
                const popularityB = b.rating.rate * b.rating.count;
                return popularityB - popularityA;
              })
              .slice(0, 5);
          })
        )
        .subscribe({
          next: (products) => {
            this.popularProducts = products;
            this.isLoading = false;
            // Initialiser le carousel une fois les données chargées
            setTimeout(() => {
              this.initCarousel();
            });
          },
          error: (error) => {
            this.error = 'Erreur lors du chargement des produits populaires';
            this.isLoading = false;
            console.error(error);
          }
        })
    );
  }

  private initCarousel(): void {
    const carouselElement = document.getElementById('popularProductsCarousel');
    if (carouselElement) {
      this.carousel = new bootstrap.Carousel(carouselElement, {
        interval: 5000,
        wrap: true
      });
    }
  }

  goToProductDetails(productId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // Arrêter le carousel avant la navigation
    if (this.carousel) {
      this.carousel.pause();
    }
    this.router.navigate(['/products/details', productId]);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Nettoyer le carousel
    if (this.carousel) {
      this.carousel.dispose();
    }
  }
}
