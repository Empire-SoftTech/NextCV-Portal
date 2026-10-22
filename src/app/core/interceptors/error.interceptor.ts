import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Backend errors: 401 → back to login (the backend also answers 401 for a
 * signed-in non-admin, so the session is dropped); 403 → access denied.
 * Always rethrown so the calling screen can still show its own message.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }
  const authService = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          void authService
            .signOut()
            .then(() => router.navigate(['/login'], { queryParams: { reason: 'unauthorized' } }));
        } else if (error.status === 403) {
          void router.navigateByUrl('/access-denied');
        }
      }
      return throwError(() => error);
    }),
  );
};
