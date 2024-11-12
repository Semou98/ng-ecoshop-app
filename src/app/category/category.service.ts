import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, take, tap, throwError } from 'rxjs';
import { Category } from '../models/category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = 'https://fakestoreapi.com/products/categories';
  private categoriesSubject = new BehaviorSubject<string[]>([]);
  private isLoading = new BehaviorSubject<boolean>(false);
  private isInitialized = false;

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading.next(true);
    this.http.get<string[]>(this.apiUrl).pipe(
      take(1),
      tap(categories => {
        this.categoriesSubject.next(categories);
        this.isLoading.next(false);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.isLoading.next(false);
        return of([]);
      })
    ).subscribe();
  }

  getAllCategories(): Observable<string[]> {
    return this.categoriesSubject.asObservable();
  }

  getLoadingState(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  /*private loadInitialCategories() {
    if (!this.isInitialized) {
      this.http.get<string[]>(this.apiUrl).subscribe(categories => {
        this.localCategories = categories;
        this.localCategoriesSubject.next(this.localCategories);
        this.isInitialized = true;
      });
    }
  }

  addCategory(category: string): Observable<string> {
    return this.http.post<string>(this.apiUrl, category).pipe(
      map(() => {
        if (!this.localCategories.includes(category)) {
          this.localCategories.push(category);
          this.localCategoriesSubject.next([...this.localCategories]);
        }
        return category;
      })
    );
  }

  updateCategory(oldCategory: string, newCategory: string): Observable<string> {
    return this.http.put<string>(`${this.apiUrl}/${oldCategory}`, newCategory).pipe(
      map(() => {
        const index = this.localCategories.indexOf(oldCategory);
        if (index !== -1) {
          this.localCategories[index] = newCategory;
          this.localCategoriesSubject.next([...this.localCategories]);
        }
        return newCategory;
      })
    );
  }

  deleteCategory(category: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${category}`).pipe(
      map(() => {
        const index = this.localCategories.indexOf(category);
        if (index !== -1) {
          this.localCategories.splice(index, 1);
          this.localCategoriesSubject.next([...this.localCategories]);
        }
      })
    );
  }

  // Méthode pour vérifier si une catégorie existe
  isCategoryExists(category: string): boolean {
    return this.localCategories.includes(category);
  }

  // Méthode pour rechercher des catégories
  searchCategories(query: string): Observable<string[]> {
    return this.getAllCategories().pipe(
      map(categories => {
        const searchTerm = query.toLowerCase().trim();
        return categories.filter(category => 
          category.toLowerCase().includes(searchTerm)
        );
      })
    );
  }*/

  private handleError(error: Error): Observable<never> {
    console.error('Une erreur s\'est produite:', error);
    return throwError(() => error);
  }
}
