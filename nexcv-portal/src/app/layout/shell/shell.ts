import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
})
export class Shell {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.authService.currentUser;

  readonly nav: { section: string; items: NavItem[] }[] = [
    {
      section: 'Overview',
      items: [{ label: 'Dashboard', path: '/dashboard' }],
    },
    {
      section: 'Notifications',
      items: [
        { label: 'Campaigns', path: '/campaigns' },
        { label: 'Registered users', path: '/app-users' },
      ],
    },
    {
      section: 'Support',
      items: [{ label: 'Users & credits', path: '/users' }],
    },
    {
      section: 'AI',
      items: [
        { label: 'Usage & cost', path: '/ai/usage' },
        { label: 'Model pricing', path: '/ai/pricing' },
      ],
    },
  ];

  async logout(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }
}
