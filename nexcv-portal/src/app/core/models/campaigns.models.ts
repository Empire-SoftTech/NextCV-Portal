/** Row shapes are SNAKE_CASE on purpose: Spring mirrors the Supabase Edge Function payloads. */
export type CampaignStatus = 'draft' | 'queued' | 'sending' | 'sent' | 'failed';
export type CampaignTargetType = 'all' | 'topic' | 'user';

export interface CampaignRow {
  id: string;
  title: string;
  body: string;
  target_type: CampaignTargetType;
  target_value: string | null;
  status: CampaignStatus;
  created_by_uid: string | null;
  created_by_email: string | null;
  created_at: string;
  open_count: number;
  recipient_count: number;
  sent_at: string | null;
  image_url: string | null;
  scheduled_at: string | null;
}

export interface CampaignRecipient {
  id: string;
  uid: string;
  email: string | null;
  display_name: string | null;
  status: string;
  sent_at: string | null;
  opened: boolean;
  opened_at: string | null;
}

export interface CampaignDetails {
  campaign: CampaignRow;
  delivered: number;
  failed: number;
  recipients: CampaignRecipient[];
  hasMore: boolean;
}

export interface CampaignDraft {
  title: string;
  body: string;
  targetType: CampaignTargetType;
  targetValue: string;
  status: 'draft' | 'queued';
  imageUrl: string | null;
  scheduledAt: string | null;
}

export interface SendCampaignResult {
  success: boolean;
  sent: number;
  failed: number;
  lastError: string | null;
}

export interface UserSearchHit {
  uid: string;
  email: string | null;
  display_name?: string | null;
  displayName?: string | null;
}

export type AppUserStatus = 'all' | 'reachable' | 'unreachable';

export interface AppUser {
  uid: string;
  email: string | null;
  display_name: string | null;
  device_count: number;
  active_device_count: number;
  last_seen: string | null;
  first_seen: string | null;
  platform: string | null;
  app_version: string | null;
}

export interface AppUsersPage {
  total: number;
  /** Users with an active device (search/date filters only; ignores the status filter). */
  reachable: number;
  /** Users with no active device. Absent when answered by the Supabase fallback. */
  unreachable?: number;
  page: number;
  pageSize: number;
  totalPages: number;
  users: AppUser[];
}
