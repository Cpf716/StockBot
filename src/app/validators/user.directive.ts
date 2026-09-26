import {
  AsyncValidator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';
import { UsersService } from '../services/users.service';
import { inject } from '@angular/core';

export class UserValidator implements AsyncValidator {
  // Member Fields

  private readonly usersService = inject(UsersService);

  // Member Functions
  validate = (control: AbstractControl): Observable<ValidationErrors | null> =>
    this.usersService.validateUser(control.value).pipe(
      map((isValidUser) => (isValidUser ? null : { invalidUser: true })),
      catchError(() => of(null)),
    );
}
