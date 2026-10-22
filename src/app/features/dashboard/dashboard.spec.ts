import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DashboardResponse } from '../../core/models/dashboard.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from './dashboard';

function sample(overrides: Partial<DashboardResponse['revenue']> = {}): DashboardResponse {
  return {
    generatedAt: '2026-10-11T10:00:00Z',
    days: 30,
    users: {
      total: 1234,
      active: 1000,
      inactive: 234,
      activeLast7Days: 400,
      activeLast30Days: 800,
      newInPeriod: 55,
      byPlatform: [{ key: 'android', count: 900 }],
      byAppVersion: [],
      signupsByDay: [{ date: '2026-10-10', count: 5 }],
    },
    campaigns: {
      total: 3,
      sent: 2,
      pending: 1,
      failed: 0,
      delivered: 90,
      deliveryFailures: 10,
      opens: 20,
      openRatePct: null,
      recent: [{ id: 'c1', title: 'Welcome', sentAt: null, recipients: null, opens: 0 }],
    },
    ai: {
      requests: 10,
      succeeded: 9,
      failed: 1,
      totalTokens: 5000,
      estimatedCost: 1.5,
      currency: 'USD',
      creditsConsumed: 7,
      avgLatencyMs: 812,
      successRatePct: 90,
      daily: [],
    },
    revenue: {
      available: true,
      unavailableReason: null,
      purchases: 4,
      purchasers: 3,
      purchasesInPeriod: 2,
      byCurrency: [{ currency: 'INR', amount: 499 }],
      topTemplates: [],
      purchasesByDay: [],
      proSubscribersAvailable: false,
      ...overrides,
    },
  };
}

async function render(get: () => unknown): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: DashboardService, useValue: { get } }],
  });
  const fixture = TestBed.createComponent(Dashboard);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Dashboard', () => {
  it('renders KPIs, em dash for null percentages and the Pro note', async () => {
    const el = await render(() => of(sample()));
    expect(el.textContent).toContain('1,234');
    expect(el.querySelector('[data-testid="open-rate"]')?.textContent?.trim()).toBe('—');
    expect(el.querySelector('[data-testid="success-rate"]')?.textContent?.trim()).toBe('90%');
    expect(el.querySelector('[data-testid="pro-note"]')).not.toBeNull();
    expect(el.querySelector('[data-testid="revenue-unavailable"]')).toBeNull();
    expect(el.textContent).toContain('INR');
    expect(el.querySelector('a[href="/campaigns/c1"]')).not.toBeNull();
  });

  it('shows the unavailable reason instead of revenue numbers', async () => {
    const el = await render(() =>
      of(sample({ available: false, unavailableReason: 'Purchases table missing' })),
    );
    expect(el.querySelector('[data-testid="revenue-unavailable"]')?.textContent).toContain(
      'Purchases table missing',
    );
    expect(el.textContent).not.toContain('Purchasers');
    expect(el.querySelector('[data-testid="pro-note"]')).not.toBeNull();
  });

  it('renders verified store metrics and hides the subscription note when connected', async () => {
    const base = sample({ proSubscribersAvailable: true });
    const el = await render(() =>
      of({
        ...base,
        store: {
          available: true,
          unavailableReason: null,
          currency: 'USD',
          updatedAt: '2026-10-11T12:00:00Z',
          metrics: [
            { id: 'mrr', name: 'MRR', unit: '$', period: 'P0D', value: 12.5 },
            { id: 'revenue', name: 'Revenue', unit: '$', period: 'P28D', value: 40 },
          ],
        },
      }),
    );
    const store = el.querySelector('[data-testid="store-metrics"]');
    expect(store?.textContent).toContain('12.50 USD');
    expect(store?.textContent).toContain('last 28 days');
    expect(el.querySelector('[data-testid="store-unavailable"]')).toBeNull();
    expect(el.querySelector('[data-testid="pro-note"]')).toBeNull();
  });

  it('explains why store metrics are missing instead of showing zeros', async () => {
    const base = sample();
    const el = await render(() =>
      of({ ...base, store: { available: false, unavailableReason: 'RevenueCat is not configured', currency: null, updatedAt: null, metrics: [] } }),
    );
    expect(el.querySelector('[data-testid="store-unavailable"]')?.textContent).toContain('not configured');
    expect(el.querySelector('[data-testid="pro-note"]')).not.toBeNull();
  });

  it('shows the error with a Retry button', async () => {
    const el = await render(() => throwError(() => new Error('boom')));
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Failed to load');
    expect(el.textContent).toContain('Retry');
  });
});
