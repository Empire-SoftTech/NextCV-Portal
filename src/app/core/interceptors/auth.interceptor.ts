import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Attaches the admin's Firebase ID token to requests targeting the backend. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }
  const authService = inject(AuthService);
  return from(authService.getIdToken()).pipe(
    switchMap((token) => {
      const authorized = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
      return next(authorized);
    }),
  );
};
