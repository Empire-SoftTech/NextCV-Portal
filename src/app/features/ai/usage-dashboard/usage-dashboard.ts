import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  GroupBy,
  PageResponse,
  UsageBucket,
  UsageGroup,
  UsageRecord,
  UsageSummary,
  UserTotals,
} from '../../../core/models/ai-usage.models';
import { apiErrorMessage } from '../../../core/models/api-error';
import { ApiService } from '../../../core/services/api.service';

const AI_PATH = '/ai';
const RECORDS_PAGE_SIZE = 20;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-usage-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usage-dashboard.html',
})
export class UsageDashboard implements OnInit {
  private readonly api = inject(ApiService);

  readonly groupByOptions: GroupBy[] = ['PROVIDER', 'MODEL', 'FEATURE'];

  /** UTC days, `to` inclusive — the backend defaults to the last 30 days when omitted. */
  readonly from = signal(isoDay(new Date(Date.now() - 29 * 86_400_000)));
  readonly to = signal(isoDay(new Date()));
  readonly groupBy = signal<GroupBy>('MODEL');
  readonly userFilter = signal('');

  readonly summary = signal<UsageSummary | null>(null);
  readonly daily = signal<UsageBucket[]>([]);
  readonly groups = signal<UsageGroup[]>([]);
  readonly topUsers = signal<UserTotals[]>([]);
  readonly records = signal<PageResponse<UsageRecord> | null>(null);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    void this.refresh();
  }

  setFrom(v: string): void {
    this.from.set(v);
  }

  setTo(v: string): void {
    this.to.set(v);
  }

  setUserFilter(v: string): void {
    this.userFilter.set(v.trim());
  }

  async setGroupBy(v: string): Promise<void> {
    this.groupBy.set(v as GroupBy);
    await this.loadGroups();
  }

  private range(): Record<string, string> {
    return { from: this.from(), to: this.to() };
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [summary, daily, topUsers] = await Promise.all([
        firstValueFrom(this.api.get<UsageSummary>(`${AI_PATH}/usage/summary`, this.range())),
        firstValueFrom(this.api.get<UsageBucket[]>(`${AI_PATH}/usage/daily`, this.range())),
        firstValueFrom(
          this.api.get<UserTotals[]>(`${AI_PATH}/usage/top-users`, { ...this.range(), limit: 10 }),
        ),
      ]);
      this.summary.set(summary);
      this.daily.set(daily);
      this.topUsers.set(topUsers);
      await Promise.all([this.loadGroups(), this.loadRecords(0)]);
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load AI usage.'));
    } finally {
      this.loading.set(false);
    }
  }

  async loadGroups(): Promise<void> {
    try {
      this.groups.set(
        await firstValueFrom(
          this.api.get<UsageGroup[]>(`${AI_PATH}/usage/breakdown`, {
            ...this.range(),
            groupBy: this.groupBy(),
          }),
        ),
      );
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load the breakdown.'));
    }
  }

  async loadRecords(page: number): Promise<void> {
    const params: Record<string, string | number> = { page, size: RECORDS_PAGE_SIZE };
    if (this.userFilter()) params['userId'] = this.userFilter();
    try {
      this.records.set(
        await firstValueFrom(
          this.api.get<PageResponse<UsageRecord>>(`${AI_PATH}/usage/records`, params),
        ),
      );
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load the request log.'));
    }
  }

  filterRecordsByUser(userId: string): void {
    this.userFilter.set(userId);
    void this.loadRecords(0);
  }

  clearUserFilter(): void {
    this.userFilter.set('');
    void this.loadRecords(0);
  }

  /** Width (%) of a day's bar relative to the busiest day in the window. */
  barWidth(bucket: UsageBucket): number {
    const max = Math.max(...this.daily().map((b) => b.totals.totalRequests), 1);
    return Math.round((bucket.totals.totalRequests / max) * 100);
  }
}
