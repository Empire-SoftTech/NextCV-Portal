import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="max-w-sm bg-white p-8 rounded-xl shadow text-center">
        <h1 class="text-xl font-semibold mb-2">Access denied</h1>
        <p class="text-sm text-gray-600 mb-6">Your account does not have permission to do that.</p>
        <a routerLink="/" class="text-blue-600 underline text-sm mr-4">Go back</a>
        <button type="button" (click)="signOut()" class="text-red-600 underline text-sm">
          Sign out
        </button>
      </div>
    </div>
  `,
})
export class AccessDenied {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async signOut(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
}
