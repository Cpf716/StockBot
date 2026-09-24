import { AuthService } from '../services/auth.service';
import {
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { MessageService } from '../services/message.service';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { RequestCounterService } from '../services/request-counter.service';
import { inject } from '@angular/core';

export function messageInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const requestCounterService = inject(RequestCounterService);
  const messageService = inject(MessageService);
  const authService = inject(AuthService);

  return next(req).pipe(
    // Set request count
    tap((event) => {
      switch (event.type) {
        case HttpEventType.Sent:
          requestCounterService.count++;
          break;
        case HttpEventType.Response:
          requestCounterService.count--;
          break;
        default:
          break;
      }
    }),
    catchError((err) => {
      requestCounterService.count--;

      messageService.postMessage(
        typeof err.error === 'string' ? err.error : err.statusText,
        {
          panelClass: 'snackbar-error',
        },
      );

      // Nullify accessToken, if unauthorized
      err.status === 401 && authService.setToken(null);

      return throwError(() => err);
    }),
  );
}
