import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { testProviders } from '../../test-providers';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { routes } from '../../app.routes';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpTestingController } from '@angular/common/http/testing';

const testUser = {
  user: 'MasterChief',
  password: 'John117',
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [...testProviders, provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    harness = await RouterTestingHarness.create();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should log in', () => {
    const component = fixture.componentInstance;

    component.userForm.patchValue(testUser);

    fixture.detectChanges();

    // Ensure that "Log In" button is enabled
    const button = fixture.nativeElement.querySelector(
      '#submit-btn',
    ) as HTMLButtonElement;

    expect(button.disabled).toBeFalsy();

    // Fetch access token
    button.click();

    // Mock /auth/login response
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(
      (r) => r.url.endsWith('/auth/login') && r.method === 'POST',
    );

    const iat = Math.floor(Date.now() / 1000);

    req.flush({
      accessToken: '',
      iat,
      exp: iat + 300,
    });
  });
});
