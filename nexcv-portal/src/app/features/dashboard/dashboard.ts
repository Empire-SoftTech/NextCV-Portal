import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiErrorMessage } from '../../core/models/api-error';
import { DashboardResponse } from '../../core/models/dashboard.models';
import { DashboardService } from '../../core/services/dashboard.service';
import {
  DAYS_OPTIONS,
  barPercent,
  formatMetric,
  formatPct,
  metricPeriodLabel,
  seriesMax,
} from './dashboard.helpers';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, NgTemplateOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly service = inject(DashboardService);

  readonly daysOptions = DAYS_OPTIONS;
  readonly days = signal<number>(30);
  readonly data = signal<DashboardResponse | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly pct = formatPct;
  readonly metric = formatMetric;
  readonly period = metricPeriodLabel;
  readonly max = seriesMax;
  readonly bar = barPercent;

  ngOnInit(): void {
    void this.refresh();
  }

  async setDays(v: string): Promise<void> {
    this.days.set(Number(v));
    await this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.data.set(await firstValueFrom(this.service.get(this.days())));
    } catch (e) {
      this.error.set(apiErrorMessage(e, 'Failed to load the dashboard.'));
    } finally {
      this.loading.set(false);
    }
  }

  counts(rows: readonly { count: number }[]): number[] {
    return rows.map((r) => r.count);
  }

  requests(rows: readonly { requests: number }[]): number[] {
    return rows.map((r) => r.requests);
  }

  dates(rows: readonly { date: string }[]): string[] {
    return rows.map((r) => r.date);
  }

  /** Width (%) of `part` within `part + other`. */
  share(part: number, other: number): number {
    const total = part + other;
    return total > 0 ? (part / total) * 100 : 0;
  }
}
