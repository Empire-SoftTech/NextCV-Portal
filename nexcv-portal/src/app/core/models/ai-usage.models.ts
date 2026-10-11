/** Mirrors the backend's admin DTOs (features/aiusage/dto). */

export interface UsageTotals {
  totalRequests: number;
  succeeded: number;
  failed: number;
  rejected: number;
  inputTokens: number;
  outputTokens: number;
  thoughtTokens: number;
  totalTokens: number;
  avgLatencyMs: number;
  creditsConsumed: number;
  estimatedCost: number;
  currency: string;
  unpricedRequests: number;
}

export interface UsageSummary {
  from: string;
  to: string;
  totals: UsageTotals;
}

export interface UsageBucket {
  period: string;
  totals: UsageTotals;
}

export interface UsageGroup {
  key: string;
  totals: UsageTotals;
}

export interface UserTotals {
  userId: string;
  totals: UsageTotals;
}

export type GroupBy = 'PROVIDER' | 'MODEL' | 'FEATURE';

export interface UsageRecord {
  id: string;
  userId?: string;
  feature: string;
  requestType: string;
  status: string;
  provider: string;
  model: string;
  creditConsumed: boolean;
  creditSource?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs?: number;
  attempts?: number;
  errorCode?: string;
  estimatedCost?: number;
  currency?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ModelPricing {
  id: string;
  provider: string;
  model: string;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  notes: string | null;
}

export interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  templateId: string | null;
  targetDescription: string;
  sentCount: number;
  failureCount: number;
  sentByUid: string;
  sentByEmail: string;
  sentAt: string;
}
