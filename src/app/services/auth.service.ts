import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from './message.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

type AccessToken = { accessToken: string; iat: number; exp: number };
type UserData = { user: string; password: string };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Member Fields

  private readonly token = new BehaviorSubject<AccessToken | null>(null);
  readonly token$ = this.token.asObservable();

  // Constructors

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router,
  ) {
    // Set accessToken, if applicable
    const token = localStorage.getItem('accessToken');

    token && this.setToken(JSON.parse(token));
  }

  // Member Functions

  /**
   * Returns the access token
   * @returns The access token object or null
   */
  getToken = () => this.token.getValue();

  /**
   * Sets the access token and stores it in localStorage, if non-null
   * Otherwise, removes it from localStorage and navigates to the login page
   * @param value The access token object or null
   */
  setToken(value: AccessToken | null) {
    this.token.next(value);

    if (this.getToken()) {
      localStorage.setItem('accessToken', JSON.stringify(this.getToken()));
    } else {
      localStorage.removeItem('accessToken');

      this.router.navigate(['login']);
    }
  }

  /**
   * Refreshes the access token, if required, and returns it
   * @returns The access token object
   */
  async load() {
    // Refresh token, if past expiration
    if (
      this.getToken() &&
      Math.floor(Date.now() / 1000) >= this.getToken()!.exp
    ) {
      try {
        return await this.refresh();
      } catch (err) {
        this.messageService.postMessage('Session timed out', {
          panelClass: 'snackbar-error',
        });
      }
    }

    return this.getToken();
  }

  /**
   * Fetches an access token
   * @param userData
   * @returns
   */
  logIn = (userData: UserData) =>
    new Promise((resolve, reject) =>
      this.http
        .post<AccessToken>(environment.apiUrl + '/auth/login', userData, {
          withCredentials: true,
        })
        .subscribe({
          next: (result: AccessToken) => {
            this.setToken(result);

            resolve(undefined);
          },
          error: reject,
        }),
    );

  /**
   * Blacklists the refresh token, nullifies the access token, and navigates to the login page
   * @returns
   */
  logOut = () =>
    this.http.delete(environment.apiUrl + '/auth/logout').subscribe({
      next: () => {
        this.setToken(null);
        this.messageService.postMessage('Goodbye!', {
          panelClass: 'snackbar-success',
        });
      },
      error: () => {},
    });

  /**
   * Refreshes the access token
   * @returns
   */
  refresh = () =>
    new Promise((resolve, reject) =>
      this.http
        .post<AccessToken>(environment.apiUrl + '/auth/refresh', null, {
          withCredentials: true,
        })
        .subscribe({
          next: (result: AccessToken) => {
            this.setToken(result);

            resolve(undefined);
          },
          error: (err) => {
            this.setToken(null);

            reject(err);
          },
        }),
    );

  /**
   * Creates a new user in the DB
   * @param userData
   * @returns
   */
  register(userData: UserData) {
    const params = new URLSearchParams(userData);

    return new Promise((resolve, reject) =>
      this.http
        .post(environment.apiUrl + '/auth/register', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'text',
        })
        .subscribe({
          next: resolve,
          error: reject,
        }),
    );
  }
}
