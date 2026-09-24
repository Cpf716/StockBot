import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { testProviders } from '../../test-providers';
import { HttpTestingController } from '@angular/common/http/testing';

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

  it('should validate password', () => {
    const component = fixture.componentInstance;

    component.userForm.patchValue(testUser);

    fixture.detectChanges();

    const testBindings = (key: string, value: string) =>
      expect(
        (fixture.nativeElement.querySelector('#' + key) as HTMLInputElement)
          .value,
      ).toBe(value);

    Object.keys(testUser).forEach((key) =>
      testBindings(key, (testUser as any)[key]),
    );

    const button = fixture.nativeElement.querySelector(
      '#submit-btn',
    ) as HTMLButtonElement;

    // Check that "Sign Up" button is disabled if "Reenter Password" is empty
    expect(button.disabled).toBeTruthy();

    component.userForm.patchValue({
      reenterPassword: 'test',
    });

    fixture.detectChanges();

    testBindings('reenter-password', 'test');

    // Check that button is disabled if passwords don't match
    expect(button.disabled).toBeTruthy();

    component.userForm.patchValue({
      reenterPassword: testUser.password,
    });

    fixture.detectChanges();

    // Check that button is enabled when user and password are non-empty and passwords match
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

    // Mock response
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
