import { StoreMetric } from '../../core/models/dashboard.models';

/** Bar size (0-100 %) relative to the series maximum; a non-zero value never rounds below 2 %. */
export function barPercent(value: number, max: number): number {
  if (!(max > 0) || !(value > 0)) return 0;
  return Math.max(2, Math.min(100, Math.round((value / max) * 100)));
}

export function seriesMax(values: readonly number[]): number {
  return values.reduce((m, v) => (v > m ? v : m), 0);
}

/** Null / non-finite percentages render as an em dash. */
export function formatPct(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${(Math.round(value * 10) / 10).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;
}

/** Money metrics ('$') use the store currency; counts are plain numbers. */
export function formatMetric(metric: StoreMetric, currency: string | null): string {
  const n = Number.isFinite(metric.value) ? metric.value : 0;
  if (metric.unit === '$') {
    return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency ?? 'USD'}`;
  }
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** 'P28D' -> 'last 28 days'; current-value metrics ('P0D'/unknown) have no caption. */
export function metricPeriodLabel(period: string | null): string | null {
  const m = /^P(\d+)D$/.exec(period ?? '');
  return m && Number(m[1]) > 0 ? `last ${m[1]} days` : null;
}

export const DAYS_OPTIONS = [7, 30, 90] as const;
