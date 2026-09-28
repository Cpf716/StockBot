import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { testProviders } from '../../test-providers';
import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';

const testUser = {
  user: 'MasterChief',
  password: 'John117',
};

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [...testProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate inputs', () => {
    const component = fixture.componentInstance;

    component.userForm.patchValue(testUser);

    fixture.detectChanges();

    // Mock /users/validate response
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(
      (r) => r.url.includes('/users/validate') && r.method === 'GET',
    );

    req.flush(true);

    fixture.detectChanges();

    // Ensure that "Sign Up" button is disabled for empty "Reenter Password"
    const button = fixture.nativeElement.querySelector(
      '#submit-btn',
    ) as HTMLButtonElement;

    expect(button.disabled).toBeTruthy();

    // Ensure that button is disabled for mistmatching password
    component.userForm.patchValue({
      reenterPassword: 'test',
    });

    fixture.detectChanges();

    expect(button.disabled).toBeTruthy();

    // Ensure that button is enabled for valid user and matching passwords
    component.userForm.patchValue({
      reenterPassword: testUser.password,
    });

    fixture.detectChanges();

    expect(button.disabled).toBeFalsy();
  });

  it('should sign up', () => {
    const component = fixture.componentInstance;

    component.userForm.patchValue({
      ...testUser,
      reenterPassword: testUser.password,
    });

    fixture.detectChanges();

    // Register new user
    fixture.nativeElement.querySelector('#submit-btn').click();

    // Mock /auth/register response
    const http = TestBed.inject(HttpTestingController);
    const req = http.expectOne(
      (r) => r.url.endsWith('/auth/register') && r.method === 'POST',
    );

    req.flush('', {
      status: 204,
      statusText: 'No Content',
    });
  });
});
