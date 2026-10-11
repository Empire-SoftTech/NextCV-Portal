/** GET /dashboard response (camelCase; LocalDate = YYYY-MM-DD, Instant = ISO string). */
export interface KeyCount {
  key: string;
  count: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface UsersKpi {
  total: number;
  active: number;
  inactive: number;
  activeLast7Days: number;
  activeLast30Days: number;
  newInPeriod: number;
  byPlatform: KeyCount[];
  byAppVersion: KeyCount[];
  signupsByDay: DateCount[];
}

export interface RecentCampaign {
  id: string;
  title: string;
  sentAt: string | null;
  recipients: number | null;
  opens: number;
}

export interface CampaignsKpi {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  delivered: number;
  deliveryFailures: number;
  opens: number;
  openRatePct: number | null;
  recent: RecentCampaign[];
}

export interface AiDaily {
  date: string;
  requests: number;
  estimatedCost: number;
}

export interface AiKpi {
  requests: number;
  succeeded: number;
  failed: number;
  totalTokens: number;
  estimatedCost: number;
  currency: string;
  creditsConsumed: number;
  avgLatencyMs: number;
  successRatePct: number | null;
  daily: AiDaily[];
}

export interface CurrencyAmount {
  currency: string;
  amount: number;
}

export interface RevenueKpi {
  available: boolean;
  unavailableReason: string | null;
  purchases: number;
  purchasers: number;
  purchasesInPeriod: number;
  byCurrency: CurrencyAmount[];
  topTemplates: KeyCount[];
  purchasesByDay: DateCount[];
  proSubscribersAvailable: boolean;
}

export interface StoreMetric {
  id: string;
  name: string;
  /** '$' for money (see StoreKpi.currency), '#' or '' for counts. */
  unit: string | null;
  /** ISO-8601: 'P0D' = current value, 'P28D' = last 28 days. */
  period: string | null;
  value: number;
}

/** Verified RevenueCat overview metrics (absent on older backends). */
export interface StoreKpi {
  available: boolean;
  unavailableReason: string | null;
  currency: string | null;
  updatedAt: string | null;
  metrics: StoreMetric[];
}

export interface DashboardResponse {
  generatedAt: string;
  days: number;
  users: UsersKpi;
  campaigns: CampaignsKpi;
  ai: AiKpi;
  revenue: RevenueKpi;
  store?: StoreKpi;
}
