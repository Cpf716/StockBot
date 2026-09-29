import { AuthService } from '../services/auth.service';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable, Subject, from, switchMap, takeUntil } from 'rxjs';
import { inject } from '@angular/core';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const canceled = new Subject<void>();

  return from(
    new Promise(async (resolve) => {
      const token = authService.getToken();

      // Do not send authorization header for the /refresh endpoint
      if (req.url.endsWith('/auth/refresh')) return resolve(null);

      // Refresh accessToken, if expiring in 30 seconds or less
      if (token && Math.floor(Date.now() / 1000) + 30 >= token.exp) {
        try {
          await authService.refresh();
        } catch (err) {
          // Cancel subsequent request if token refresh fails
          canceled.next();
          canceled.complete();
        }
      }

      resolve(authService.getToken());
    }),
  ).pipe(
    takeUntil(canceled),
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
