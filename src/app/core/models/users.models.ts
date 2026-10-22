/** Mirrors the backend's admin users and credits DTOs (features/users, features/credits). */
import { UsageSummary } from './ai-usage.models';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  disabled: boolean;
  providers: string[];
  admin: boolean;
  createdAt: string | null;
  lastSignInAt: string | null;
}

export type AccessLevel = 'FREE' | 'PURCHASED' | 'PRO';

export interface CreditStatus {
  feature: string;
  accessLevel: AccessLevel;
  nextAction: string;
  denialReason: string | null;
  includedLimit: number;
  remainingIncluded: number;
  remainingAdEarned: number;
  freeUsesToday: number;
  freeDailyLimit: number;
  periodEnd: string | null;
}

export interface UserOverview {
  profile: UserProfile;
  credits: CreditStatus[];
  usage: UsageSummary;
}

export interface AdCreditSummary {
  granted: number;
  used: number;
  remaining: number;
}

export interface TierBalance {
  accessLevel: AccessLevel;
  includedLimit: number;
  includedUsed: number;
  freeUsageCount: number;
  periodStart: string | null;
  periodEnd: string | null;
  anchorAt: string | null;
}

export interface AdminCreditOverview {
  status: CreditStatus;
  adCredits: AdCreditSummary;
  tiers: TierBalance[];
}

export type LedgerEntryType = 'DEBIT' | 'REFUND' | 'AD_GRANT' | 'ADMIN_GRANT' | 'ADMIN_REVOKE';

/** Optional fields are omitted by the backend when null. */
export interface LedgerEntry {
  id: string;
  entryType: LedgerEntryType;
  source: string;
  accessLevel?: AccessLevel;
  amount: number;
  usageId?: string;
  adRewardId?: string;
  actorId?: string;
  note?: string;
  createdAt: string;
}

export interface AdjustCreditsRequest {
  feature: string;
  delta: number;
  reason: string;
}
