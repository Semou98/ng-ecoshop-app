import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;
    let localStorageMock: { [key: string]: string } = {};

  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleTable = console.table;

  // Mock data
  const mockProducts: Product[] = [
    {
      id: 1,
      title: "Test Product 1",
      price: 99.99,
      description: "Test description 1",
      category: "electronics",
      image: "test1.jpg",
      rating: { rate: 4.5, count: 100 }
    },
    {
      id: 2,
      title: "Test Product 2",
      price: 29.99,
      description: "Test description 2",
      category: "clothing",
      image: "test2.jpg",
      rating: { rate: 4.0, count: 50 }
    }
  ];

  const mockCategories: string[] = ["electronics", "clothing", "jewelery", "men's clothing"];

  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.table = jest.fn();

    // Mock localStorage
    localStorageMock = {};
    Storage.prototype.getItem = jest.fn((key) => localStorageMock[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      localStorageMock[key] = value.toString();
    });
    Storage.prototype.removeItem = jest.fn((key) => {
      delete localStorageMock[key];
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.table = originalConsoleTable;

    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should load data from API when localStorage is empty', (done) => {
      service.initialize().subscribe(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('products', JSON.stringify(mockProducts));
        expect(localStorage.setItem).toHaveBeenCalledWith('categories', JSON.stringify(mockCategories));
        done();
      });

      // Gérer les requêtes HTTP
      const productsReq = httpMock.expectOne('https://fakestoreapi.com/products');
      const categoriesReq = httpMock.expectOne('https://fakestoreapi.com/products/categories');
      
      productsReq.flush(mockProducts);
      categoriesReq.flush(mockCategories);
    });

    it('should load data from localStorage when available', (done) => {
      // Pré-remplir localStorage
      localStorage.setItem('products', JSON.stringify(mockProducts));
      localStorage.setItem('categories', JSON.stringify(mockCategories));

      service.initialize().subscribe(([products, categories]) => {
        expect(products).toEqual(mockProducts);
        expect(categories).toEqual(mockCategories);
        done();
      });

      // Vérifier qu'aucune requête HTTP n'est faite
      httpMock.expectNone('https://fakestoreapi.com/products');
      httpMock.expectNone('https://fakestoreapi.com/products/categories');
    });
  });

  describe('getAllProducts', () => {
    beforeEach(() => {
      localStorage.setItem('products', JSON.stringify(mockProducts));
      localStorage.setItem('categories', JSON.stringify(mockCategories));
      service.initialize().subscribe();
    });

    it('should return products from localStorage', (done) => {
      service.getAllProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
        done();
      });
    });
  });

  describe('createProduct', () => {
    it('should create a new product and update localStorage', (done) => {
      const newProduct: Partial<Product> = {
        title: "New Product",
        price: 49.99,
        description: "New description",
        category: "electronics",
        image: "new.jpg"
      };

      const expectedProduct = {
        ...newProduct,
        id: 3,
        rating: { rate: 0, count: 0 }
      };

      localStorage.setItem('products', JSON.stringify(mockProducts));

      service.createProduct(newProduct).subscribe(product => {
        expect(product.id).toBe(3);
        expect(product.title).toBe(newProduct.title!);
        
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        expect(storedProducts[0]).toEqual(expectedProduct);
        done();
      });

      const req = httpMock.expectOne('https://fakestoreapi.com/products');
      expect(req.request.method).toBe('POST');
      req.flush(newProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update existing product and localStorage', (done) => {
      localStorage.setItem('products', JSON.stringify(mockProducts));

      const updatedProduct: Partial<Product> = {
        id: 1,
        title: "Updated Product",
        price: 199.99
      };

      service.updateProduct(1, updatedProduct).subscribe(product => {
        expect(product.title).toBe("Updated Product");
        expect(product.price).toBe(199.99);
        
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedStoredProduct = storedProducts.find((p: Product) => p.id === 1);
        expect(updatedStoredProduct.title).toBe("Updated Product");
        done();
      });

      const req = httpMock.expectOne('https://fakestoreapi.com/products/1');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and update localStorage', (done) => {
      localStorage.setItem('products', JSON.stringify(mockProducts));

      service.deleteProduct(1).subscribe(() => {
        const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        expect(storedProducts.length).toBe(1);
        expect(storedProducts.find((p: Product) => p.id === 1)).toBeUndefined();
        expect(console.table).toHaveBeenCalled(); // Vérification de l'appel à console.table
        done();
      });

      const req = httpMock.expectOne('https://fakestoreapi.com/products/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  })

  describe('searchProducts', () => {
    beforeEach(() => {
      localStorage.setItem('products', JSON.stringify(mockProducts));
    });

    it('should return all products when search query is empty', (done) => {
      service.searchProducts('').subscribe(products => {
        expect(products).toEqual(mockProducts);
        done();
      });
    });

    it('should find products by title', (done) => {
      service.searchProducts('Test Product 1').subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].id).toBe(1);
        done();
      });
    });

    it('should find products by category', (done) => {
      service.searchProducts('electronics').subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].category).toBe('electronics');
        done();
      });
    });

    it('should find products by price', (done) => {
      service.searchProducts('99.99').subscribe(products => {
        expect(products.length).toBe(1);
        expect(products[0].price).toBe(99.99);
        done();
      });
    });
  });

  describe('getProductById', () => {
    beforeEach(() => {
      localStorage.setItem('products', JSON.stringify(mockProducts));
    });

    it('should return product when found', (done) => {
      service.getProductById(1).subscribe(product => {
        expect(product).toBeTruthy();
        expect(product?.id).toBe(1);
        done();
      });
    });

    it('should return null when product not found', (done) => {
      service.getProductById(999).subscribe(product => {
        expect(product).toBeNull();
        done();
      });
    });
  });
});