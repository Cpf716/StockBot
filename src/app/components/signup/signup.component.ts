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

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit {
  // Member Fields

  userForm: FormGroup;

  // Constructors

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {
    this.userForm = new FormGroup({
      user: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      reenterPassword: new FormControl('', [
        Validators.required,
        this.matchingPasswordsValidator(),
      ]),
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
