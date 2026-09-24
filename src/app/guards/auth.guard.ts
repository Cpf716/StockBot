import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Refreshes accessToken, if required, and returns its truthy value
 * @returns True if accessToken is valid, otherwise false
 */
export const authGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (await authService.load()) return true;
  else {
    // If refresh() errs, this becomes redundant; can it be improved?
    router.navigate(['login']);

    return false;
  }
};
