import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app/app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductService } from './app/product/product.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [ AppComponent ],
      providers: [
        ProductService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});