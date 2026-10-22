import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Waits for Firebase Auth's first state resolution before deciding — avoids a
 *  false redirect to /login on page refresh while auth state is still loading. */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  await authService.authReady;
  return authService.currentUser() ? true : router.createUrlTree(['/login']);
};
