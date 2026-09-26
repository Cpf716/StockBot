import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MessageService } from '../../services/message.service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { UserValidator } from '../../validators/user.directive';
import { inject } from '@angular/core';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  providers: [UserValidator],
})
export class SignupComponent implements OnInit {
  // Member Fields

  userForm: FormGroup;
  userValidator = inject(UserValidator);

  // Constructors

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.userForm = new FormGroup({
      user: new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [this.userValidator.validate.bind(this.userValidator)],
        updateOn: 'blur',
      }),
      password: new FormControl('', {
        validators: Validators.required,
        updateOn: 'change',
      }),
      reenterPassword: new FormControl('', {
        validators: [Validators.required, this.matchingPasswordsValidator()],
        updateOn: 'change',
      }),
    });
  }

  ngOnInit() {
    this.authService
      .load()
      .then((token) => token && this.router.navigate(['']));
  }

  // Accessors

  get password() {
    return this.userForm?.get('password');
  }

  get reenterPassword() {
    return this.userForm?.get('reenterPassword');
  }

  get user() {
    return this.userForm?.get('user');
  }

  // Member Functions

  /**
   * Registers the user and navigates to the login page
   */
  async signUp() {
    if (this.userForm.invalid) return;

    try {
      await this.authService.register({
        user: this.user!.value,
        password: this.password!.value,
      });
      this.messageService.postMessage('Success. Please log in', {
        panelClass: 'snackbar-success',
      });

      this.logIn();
    } catch (err) {}
  }

  /**
   * Navigates to the login page
   * @returns
   */
  logIn = () => this.router.navigate(['login']);

  /**
   * Validates passwords and returns null, otherwise returns an error if mismatching
   * @returns The password mismatch error object or null
   */
  matchingPasswordsValidator =
    (): ValidatorFn =>
    (control: AbstractControl): ValidationErrors | null =>
      this.password?.value === this.reenterPassword?.value
        ? null
        : { passwordMismatch: true };
}
