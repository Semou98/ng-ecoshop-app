import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';
import { CartItem } from '../interfaces/cart-item.interface';

describe('CartService', () => {
  let service: CartService;
  let localStorageMock: { [key: string]: string } = {};

  // Produit de test
  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price: 99.99,
    description: 'Test Description',
    category: 'Test Category',
    image: 'test-image.jpg',
    rating: { rate: 4.5, count: 100 }
  };

  beforeEach(() => {
    // Réinitialiser le mock du localStorage avant chaque test
    localStorageMock = {};
    
    // Configuration du mock du localStorage
    Storage.prototype.getItem = jest.fn((key) => localStorageMock[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      localStorageMock[key] = value.toString();
    });
    Storage.prototype.removeItem = jest.fn((key) => {
      delete localStorageMock[key];
    });

    TestBed.configureTestingModule({
      providers: [CartService]
    });
  });

  beforeEach(() => {
    service = TestBed.inject(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCartItems', () => {
    it('should return stored items when cart has items', () => {
      const mockItems: CartItem[] = [{ product: mockProduct, quantity: 1 }];
      // Stockage direct dans le localStorage mock
      localStorage.setItem('cart', JSON.stringify(mockItems));
      
      // Créer une nouvelle instance du service pour qu'il lise les nouvelles données
      const newService = TestBed.inject(CartService);
      newService.loadFromStorage(); // Forcer le chargement depuis le localStorage
      
      expect(newService.getCartItems()).toEqual(mockItems);
    });
  });

  describe('addToCart', () => {
    it('should add new item to empty cart', () => {
      service.addToCart(mockProduct);
      expect(service.getCartItems()).toEqual([
        { product: mockProduct, quantity: 1 }
      ]);
    });

    it('should increment quantity for existing item', () => {
      service.addToCart(mockProduct);
      service.addToCart(mockProduct);
      expect(service.getCartItems()).toEqual([
        { product: mockProduct, quantity: 2 }
      ]);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      service.addToCart(mockProduct);
      service.removeFromCart(mockProduct.id);
      expect(service.getCartItems()).toEqual([]);
    });

    it('should handle removing non-existent item', () => {
      service.removeFromCart(999);
      expect(service.getCartItems()).toEqual([]);
    });
  });

  describe('updateQuantity', () => {
    it('should update quantity of existing item', () => {
      service.addToCart(mockProduct);
      service.updateQuantity(mockProduct.id, 3);
      expect(service.getCartItems()[0].quantity).toBe(3);
    });

    it('should not allow quantity less than 1', () => {
      service.addToCart(mockProduct);
      service.updateQuantity(mockProduct.id, 0);
      expect(service.getCartItems()[0].quantity).toBe(1);
    });

    it('should not modify cart for non-existent item', () => {
      service.addToCart(mockProduct);
      const initialState = service.getCartItems();
      service.updateQuantity(999, 3);
      expect(service.getCartItems()).toEqual(initialState);
    });
  });

  describe('getCartTotal', () => {
    it('should calculate total correctly for empty cart', () => {
      expect(service.getCartTotal()).toBe(0);
    });

    it('should calculate total correctly for multiple items', () => {
      const product2: Product = { ...mockProduct, id: 2, price: 50 };
      service.addToCart(mockProduct); // 99.99
      service.addToCart(mockProduct); // 99.99 * 2
      service.addToCart(product2); // 50
      expect(service.getCartTotal()).toBeCloseTo(249.98, 2);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      service.addToCart(mockProduct);
      service.clearCart();
      expect(service.getCartItems()).toEqual([]);
      // Vérifier que le localStorage a été vidé
      expect(localStorage.getItem('cart')).toBe(null);
    });
  });

  describe('getCartCount', () => {
    it('should return 0 for empty cart', () => {
      expect(service.getCartCount()).toBe(0);
    });

    it('should return total quantity of all items', () => {
      const product2: Product = { ...mockProduct, id: 2 };
      service.addToCart(mockProduct); // quantity: 1
      service.addToCart(mockProduct); // quantity: 2
      service.addToCart(product2); // quantity: 1
      expect(service.getCartCount()).toBe(3);
    });
  });
});