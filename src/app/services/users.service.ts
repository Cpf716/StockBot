import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // Constructors

  constructor(private http: HttpClient) {}

  // Member Functions

  /**
   * Returns true if user is valid, otherwise returns false
   * @param user
   * @returns
   */
  validateUser = (user: string) =>
    this.http.get<boolean>(`${environment.apiUrl}/users/validate?id=${user}`);
}
