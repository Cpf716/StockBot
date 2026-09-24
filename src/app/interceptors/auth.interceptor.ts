import { AuthService } from '../services/auth.service';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { inject } from '@angular/core';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);

  return from(
    new Promise(async (resolve) => {
      const token = authService.getToken();

      // Do not send authorization header for the /refresh endpoint
      if (req.url.endsWith('/auth/refresh')) return resolve(null);

      // Refresh accessToken, if expiring in 30 seconds or less
      if (token && Math.floor(Date.now() / 1000) + 30 >= token.exp) {
        try {
          await authService.refresh();
        } catch (err) {}
      }

      resolve(authService.getToken());
    }),
  ).pipe(
    switchMap((token: any) => {
      // Set authorization header, if applicable
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: 'Bearer ' + token.accessToken,
          },
        });
      }

      return next(req);
    }),
  );
}
