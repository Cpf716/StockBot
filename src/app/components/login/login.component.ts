import { AuthService } from '../../services/auth.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  // Member Fields

  userForm: FormGroup;
  showPassword = false;

  @ViewChild('passwordInput') passwordInput!: ElementRef;

  // Constructors

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.userForm = new FormGroup({
      user: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
  }

  async ngOnInit() {
    this.authService
      .load()
      .then((token) => token && this.router.navigate(['']));
  }

  // Accessors

  get password() {
    return this.userForm.get('password');
  }

  get user() {
    return this.userForm.get('user');
  }

  // Member Functions

  focusPassword = () => this.passwordInput.nativeElement.focus();

  /**
   * Validates the user and navigates to the "quote" page
   * @returns
   */
  logIn() {
    if (this.userForm.invalid) return;

    this.authService
      .logIn(this.userForm.value)
      .then(() => this.router.navigate(['']))
      .catch(() => {});
  }

  /**
   * Shows/hides the password
   */
  toggleShowPassword() {
    this.showPassword = !this.showPassword;

    setTimeout(
      () =>
        ((document.getElementById('password-cb') as HTMLInputElement).checked =
          this.showPassword),
    );
  }

  /**
   * Navigates to the sign up page
   * @returns
   */
  signUp = () => this.router.navigate(['signup']);
}
