import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../../core/models/api-error';
import { AppUserStatus, AppUsersPage } from '../../../core/models/campaigns.models';
import { CampaignsService } from '../../../core/services/campaigns.service';

const PAGE_SIZE = 25;
const DAY_MS = 86_400_000;

/** "Who is active" / "who has gone quiet" presets — same set as the admin app's Users tab. */
export type LastActivePreset = 'any' | 'today' | '7d' | '30d' | 'inactive30';

export const LAST_ACTIVE_OPTIONS: { value: LastActivePreset; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Active today' },
  { value: '7d', label: 'Active in last 7 days' },
  { value: '30d', label: 'Active in last 30 days' },
  { value: 'inactive30', label: 'Inactive 30+ days' },
];

/** (after, before) as full ISO-8601 instants — Spring rejects date-only values. */
export function lastActiveCutoffs(
  preset: LastActivePreset,
  now: Date = new Date(),
): { lastSeenAfter: string; lastSeenBefore: string } {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const iso = (ms: number) => new Date(ms).toISOString();
  switch (preset) {
    case 'today':
      return { lastSeenAfter: iso(today), lastSeenBefore: '' };
    case '7d':
      return { lastSeenAfter: iso(today - 7 * DAY_MS), lastSeenBefore: '' };
    case '30d':
      return { lastSeenAfter: iso(today - 30 * DAY_MS), lastSeenBefore: '' };
    case 'inactive30':
      return { lastSeenAfter: '', lastSeenBefore: iso(today - 30 * DAY_MS) };
    default:
      return { lastSeenAfter: '', lastSeenBefore: '' };
  }
}

@Component({
  selector: 'app-app-users',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-users.html',
})
export class AppUsers implements OnInit {
  private readonly campaigns = inject(CampaignsService);

  readonly lastActiveOptions = LAST_ACTIVE_OPTIONS;
  readonly data = signal<AppUsersPage | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly filters = new FormGroup({
    query: new FormControl('', { nonNullable: true }),
    status: new FormControl<AppUserStatus>('all', { nonNullable: true }),
    lastActive: new FormControl<LastActivePreset>('any', { nonNullable: true }),
  });

  /** Total / active / inactive for the current search + last-active filters, independent of the status filter. */
  readonly summary = computed(() => {
    const d = this.data();
    if (!d) return null;
    const status = this.filters.controls.status.value;
    // The Supabase fallback does not send `unreachable`; derive it only when `total` is unfiltered by status.
    const unreachable = d.unreachable ?? (status === 'all' ? d.total - d.reachable : null);
    return { reachable: d.reachable, unreachable, total: unreachable === null ? null : d.reachable + unreachable };
  });

  readonly filterCount = signal(0);
  readonly syncing = signal(false);
  readonly syncMessage = signal<string | null>(null);

  ngOnInit(): void {
    void this.load(1);
  }

  search(): void {
    void this.load(1);
  }

  /** The summary cards double as quick status filters. */
  setStatus(status: AppUserStatus): void {
    this.filters.controls.status.setValue(status);
    void this.load(1);
  }

  /** One-time (and safe to repeat) copy of exact signup dates from Firebase Auth. */
  async syncSignups(): Promise<void> {
    this.syncing.set(true);
    this.syncMessage.set(null);
    this.error.set(null);
    try {
      const r = await firstValueFrom(this.campaigns.syncSignups());
      this.syncMessage.set(`Signup dates updated from ${r.accountsRead} Firebase accounts.`);
      await this.load(1);
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Could not sync signup dates.'));
    } finally {
      this.syncing.set(false);
    }
  }

  clear(): void {
    this.filters.reset();
    void this.load(1);
  }

  async load(page: number): Promise<void> {
    const f = this.filters.getRawValue();
    this.filterCount.set((f.query.trim() ? 1 : 0) + (f.status !== 'all' ? 1 : 0) + (f.lastActive !== 'any' ? 1 : 0));
    this.loading.set(true);
    this.error.set(null);
    try {
      this.data.set(
        await firstValueFrom(
          this.campaigns.appUsers({
            query: f.query.trim(),
            status: f.status,
            ...lastActiveCutoffs(f.lastActive),
            page,
            pageSize: PAGE_SIZE,
          }),
        ),
      );
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load users.'));
    } finally {
      this.loading.set(false);
    }
  }
}
