import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productsApiUrl = 'https://fakestoreapi.com/products';
  private categoriesApiUrl = 'https://fakestoreapi.com/products/categories';
  private localProducts: Product[] = [];
  public localProductsSubject = new BehaviorSubject<Product[]>([]);
  private localCategoriesSubject = new BehaviorSubject<string[]>([]);
  private isInitialized = false;
  
  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  private loadInitialData() {
    if (!this.isInitialized) {
      // Charger les produits
      this.http.get<Product[]>(`${this.productsApiUrl}`).subscribe(products => {
        this.localProducts = products;
        this.localProductsSubject.next(this.localProducts);
      });
      // Charger les catégories
      this.http.get<string[]>(`${this.categoriesApiUrl}`).subscribe(categories => {
        this.localCategoriesSubject.next(categories);
      });
      this.isInitialized = true;
    }
  }

  getAllProducts(): Observable<Product[]> {
    return this.localProductsSubject.asObservable();
  }

  getAllCategories(): Observable<string[]> {
    return this.localCategoriesSubject.asObservable();
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.productsApiUrl, product).pipe(
      map(response => {
        const newProduct = {
          ...response,
          id: this.generateNewId(),
          rating: { rate: 0, count: 0 }
        };
        this.localProducts.unshift(newProduct);
        this.localProductsSubject.next([...this.localProducts]);
        return newProduct;
      }),
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null))
    );
  }

  private generateNewId(): number {
    return this.localProducts.length > 0 
      ? Math.max(...this.localProducts.map(p => Number(p.id))) + 1 
      : 1;
  }

  updateProduct(id: number | string, updatedProduct: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.productsApiUrl}/${id}`, updatedProduct).pipe(
      map(() => {
        const index = this.localProducts.findIndex(p => p.id === Number(id));
        if (index !== -1) {
          const updated = {
            ...this.localProducts[index],
            ...updatedProduct,
            id: Number(id)
          };
          this.localProducts[index] = updated;
          this.localProductsSubject.next([...this.localProducts]);
          return updated;
        }
        throw new Error('Product not found');
      }),
      tap((response) => this.log(response)),
      catchError((error) => this.handleError(error, null))
    );
  }

  getProductById(id: string | number): Observable<Product | null> {
    return this.getAllProducts().pipe(
      map(products => {
        const product = products.find(p => p.id === Number(id));
        return product || null;
      }),
      tap(product => {
        if (!product) {
          console.warn(`Product with id ${id} not found`);
        }
      })
    );
  }  

  /******************************* RECHERCHE DE PRODUITS **********************************/

  searchProducts(query: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => {
        if (!query.trim()) return products;
        
        query = query.toLowerCase().trim();
        return products.filter(product => 
          this.productMatchesSearch(product, query)
        );
      })
    );
  }

  private productMatchesSearch(product: Product, query: string): boolean {
    return (
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.price.toString().includes(query)
    );
  }

  /******************************* FILTRE DE PRODUITS **********************************/

  getProductsInCategory(category: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(p => p.category === category))
    );
  }

  getLimitedProducts(limit: number): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => products.slice(0, limit))
    );
  }

  getSortedProducts(sortOrder: 'asc' | 'desc'): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => {
        const sorted = [...products].sort((a, b) => {
          if (sortOrder === 'asc') {
            return a.price - b.price;
          }
          return b.price - a.price;
        });
        return sorted;
      })
    );
  }

  deleteProduct(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.productsApiUrl}/${id}`).pipe(
      map(() => {
        const index = this.localProducts.findIndex(p => p.id === Number(id));
        if (index !== -1) {
          this.localProducts.splice(index, 1);
          this.localProductsSubject.next([...this.localProducts]);
        }
      }),
      tap(() => this.log(`Product ${id} deleted`)),
      catchError((error) => this.handleError(error, null))
    );
  }

  /***************************** METHODES GENERIQUES ***************************************/

  // Méthode générique pour loguer la réponse
  private log(response: any){
    console.table(response)
  }

  // Méthode générique pour gérer les erreurs
  private handleError(error: Error, errorValue: any){
    console.error('Une erreur s\'est produite:',error)
    return of(errorValue)
  }
}
