import { Component } from '@angular/core';
import { Product } from '../models/product.model';
import { interval, map, Subscription, takeWhile } from 'rxjs';
import { ProductService } from '../product/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  popularProducts: Product[] = [];
  activeSlide = 0;
  private subscription: Subscription = new Subscription();
  private alive = true;
  isLoading = true;
  error: string | null = null;
  private autoplayInterval = 5000; // 5 secondes

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPopularProducts();
    this.startCarouselAutoplay();
  }

  private loadPopularProducts(): void {
    this.subscription.add(
      this.productService.getAllProducts()
        .pipe(
          map(products => {
            // Trier les produits par popularité (rating.rate * rating.count)
            return products
              .sort((a, b) => {
                const popularityA = a.rating.rate * a.rating.count;
                const popularityB = b.rating.rate * b.rating.count;
                return popularityB - popularityA;
              })
              .slice(0, 5); // Prendre exactement les 5 premiers produits
          })
        )
        .subscribe({
          next: (products) => {
            this.popularProducts = products;
            this.isLoading = false;
          },
          error: (error) => {
            this.error = 'Erreur lors du chargement des produits populaires';
            this.isLoading = false;
            console.error(error);
          }
        })
    );
  }

  private startCarouselAutoplay(): void {
    this.subscription.add(
      interval(this.autoplayInterval)
        .pipe(takeWhile(() => this.alive))
        .subscribe(() => {
          this.nextSlide();
        })
    );
  }

  // Méthodes pour le carrousel
  nextSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % this.popularProducts.length;
  }

  previousSlide(): void {
    this.activeSlide = (this.activeSlide - 1 + this.popularProducts.length) % this.popularProducts.length;
  }

  setSlide(index: number): void {
    this.activeSlide = index;
  }

  // Gestion du clavier pour l'accessibilité
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        this.previousSlide();
        break;
      case 'ArrowRight':
        this.nextSlide();
        break;
    }
  }

  ngOnDestroy(): void {
    this.alive = false;
    this.subscription.unsubscribe();
  }

  goToProductDetails(productId: number): void {
    // Arrêter l'autoplay quand on navigue vers les détails
    this.alive = false;
    this.router.navigate(['/products/details', productId]);
  }
}
