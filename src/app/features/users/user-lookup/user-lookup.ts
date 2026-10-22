import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PageResponse } from '../../../core/models/ai-usage.models';
import { apiErrorMessage } from '../../../core/models/api-error';
import {
  AdCreditSummary,
  AdjustCreditsRequest,
  AdminCreditOverview,
  LedgerEntry,
  UserOverview,
  UserProfile,
} from '../../../core/models/users.models';
import { ApiService } from '../../../core/services/api.service';

type SearchBy = 'email' | 'uid';

const FEATURE = 'resume_ai_review';
const LEDGER_PAGE_SIZE = 20;
const MAX_ADJUSTMENT = 100;

@Component({
  selector: 'app-user-lookup',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-lookup.html',
})
export class UserLookup implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  readonly maxAdjustment = MAX_ADJUSTMENT;

  readonly searchBy = signal<SearchBy>('email');
  readonly searchForm = new FormGroup({
    query: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly overview = signal<UserOverview | null>(null);
  readonly credits = signal<AdminCreditOverview | null>(null);
  readonly ledger = signal<PageResponse<LedgerEntry> | null>(null);

  readonly searching = signal(false);
  readonly searchError = signal<string | null>(null);

  readonly adjustForm = new FormGroup({
    direction: new FormControl<'GRANT' | 'REVOKE'>('GRANT', { nonNullable: true }),
    amount: new FormControl<number | null>(1, [
      Validators.required,
      Validators.min(1),
      Validators.max(MAX_ADJUSTMENT),
    ]),
    reason: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
  });
  readonly adjusting = signal(false);
  readonly adjustError = signal<string | null>(null);
  readonly adjustSuccess = signal<string | null>(null);

  ngOnInit(): void {
    const uid = this.route.snapshot.queryParamMap.get('uid');
    if (uid) {
      this.searchBy.set('uid');
      this.searchForm.controls.query.setValue(uid);
      void this.search();
    }
  }

  setSearchBy(value: string): void {
    this.searchBy.set(value === 'uid' ? 'uid' : 'email');
  }

  async search(): Promise<void> {
    if (this.searchForm.invalid) return;
    const query = this.searchForm.controls.query.value.trim();
    this.searching.set(true);
    this.searchError.set(null);
    this.overview.set(null);
    this.credits.set(null);
    this.ledger.set(null);
    this.adjustError.set(null);
    this.adjustSuccess.set(null);
    try {
      const uid =
        this.searchBy() === 'uid'
          ? query
          : (await firstValueFrom(this.api.get<UserProfile>('/users/lookup', { email: query }))).uid;
      this.overview.set(
        await firstValueFrom(this.api.get<UserOverview>(`/users/${encodeURIComponent(uid)}/overview`)),
      );
      await Promise.all([this.loadCredits(uid), this.loadLedger(uid, 0)]);
    } catch (e) {
      this.searchError.set(apiErrorMessage(e, 'Lookup failed.'));
    } finally {
      this.searching.set(false);
    }
  }

  private creditsPath(uid: string): string {
    return `/ai/credits/users/${encodeURIComponent(uid)}`;
  }

  async loadCredits(uid: string): Promise<void> {
    this.credits.set(
      await firstValueFrom(
        this.api.get<AdminCreditOverview>(this.creditsPath(uid), { feature: FEATURE }),
      ),
    );
  }

  async loadLedger(uid: string, page: number): Promise<void> {
    this.ledger.set(
      await firstValueFrom(
        this.api.get<PageResponse<LedgerEntry>>(`${this.creditsPath(uid)}/ledger`, {
          feature: FEATURE,
          page,
          size: LEDGER_PAGE_SIZE,
        }),
      ),
    );
  }

  async goToLedgerPage(page: number): Promise<void> {
    const uid = this.overview()?.profile.uid;
    if (!uid) return;
    try {
      await this.loadLedger(uid, page);
    } catch (e) {
      this.adjustError.set(apiErrorMessage(e, 'Failed to load the ledger.'));
    }
  }

  /** Signed delta the backend expects: revoke is negative. */
  signedDelta(): number {
    const { direction, amount } = this.adjustForm.getRawValue();
    return (direction === 'REVOKE' ? -1 : 1) * (amount ?? 0);
  }

  async adjust(): Promise<void> {
    const uid = this.overview()?.profile.uid;
    if (!uid || this.adjusting() || this.adjustForm.invalid) return;
    const delta = this.signedDelta();
    const who = this.overview()?.profile.email ?? uid;
    const verb = delta > 0 ? `Grant ${delta}` : `Revoke ${-delta}`;
    // Credits are real value and the ledger is permanent — confirm the exact change.
    if (!confirm(`${verb} credit(s) ${delta > 0 ? 'to' : 'from'} ${who}? This is recorded in the ledger.`)) {
      return;
    }
    const request: AdjustCreditsRequest = {
      feature: FEATURE,
      delta,
      reason: this.adjustForm.controls.reason.value.trim(),
    };
    this.adjusting.set(true);
    this.adjustError.set(null);
    this.adjustSuccess.set(null);
    try {
      const pool = await firstValueFrom(
        this.api.post<AdCreditSummary>(`${this.creditsPath(uid)}/adjust`, request),
      );
      this.adjustSuccess.set(`Done. Ad-earned credits remaining: ${pool.remaining}.`);
      this.adjustForm.patchValue({ amount: 1, reason: '' });
      await Promise.all([this.loadCredits(uid), this.loadLedger(uid, 0)]);
    } catch (e) {
      this.adjustError.set(apiErrorMessage(e, 'Failed to adjust credits.'));
    } finally {
      this.adjusting.set(false);
    }
  }
}
