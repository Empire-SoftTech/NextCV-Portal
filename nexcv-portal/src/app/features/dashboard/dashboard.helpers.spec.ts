import { barPercent, formatMetric, formatPct, metricPeriodLabel, seriesMax } from './dashboard.helpers';

describe('dashboard helpers', () => {
  it('scales bars against the max', () => {
    expect(barPercent(50, 100)).toBe(50);
    expect(barPercent(100, 100)).toBe(100);
    expect(barPercent(0, 100)).toBe(0);
    expect(barPercent(5, 0)).toBe(0);
  });

  it('keeps tiny non-zero bars visible', () => {
    expect(barPercent(1, 1000)).toBe(2);
  });

  it('finds the series max, 0 when empty', () => {
    expect(seriesMax([3, 9, 4])).toBe(9);
    expect(seriesMax([])).toBe(0);
  });

  it('formats percentages, null as em dash', () => {
    expect(formatPct(null)).toBe('—');
    expect(formatPct(undefined)).toBe('—');
    expect(formatPct(NaN)).toBe('—');
    expect(formatPct(98.76)).toBe('98.8%');
    expect(formatPct(0)).toBe('0%');
  });

  it('formats money metrics with the store currency and counts as plain numbers', () => {
    expect(formatMetric({ id: 'mrr', name: 'MRR', unit: '$', period: 'P0D', value: 12.5 }, 'USD')).toBe('12.50 USD');
    expect(formatMetric({ id: 'a', name: 'Active', unit: '#', period: 'P0D', value: 1234 }, 'USD')).toBe('1,234');
    expect(formatMetric({ id: 'm', name: 'M', unit: '$', period: null, value: 3 }, null)).toBe('3.00 USD');
  });

  it('labels windowed metrics only', () => {
    expect(metricPeriodLabel('P28D')).toBe('last 28 days');
    expect(metricPeriodLabel('P0D')).toBeNull();
    expect(metricPeriodLabel(null)).toBeNull();
  });
});
