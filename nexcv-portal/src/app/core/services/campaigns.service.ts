import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AppUserStatus,
  AppUsersPage,
  CampaignDetails,
  CampaignDraft,
  CampaignRow,
  SendCampaignResult,
  UserSearchHit,
} from '../models/campaigns.models';
import { ApiService } from './api.service';

export interface AppUsersQuery {
  page: number;
  pageSize: number;
  query: string;
  status: AppUserStatus;
  lastSeenAfter: string;
  lastSeenBefore: string;
}

/** Campaign + registered-user endpoints: Spring primary, Supabase function fallback (see ApiService). */
@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private readonly api = inject(ApiService);

  list(): Observable<{ campaigns: CampaignRow[] }> {
    return this.api.get('/campaigns', undefined, { function: 'list-campaigns', body: {} });
  }

  details(id: string, offset: number): Observable<CampaignDetails> {
    return this.api.get(
      `/campaigns/${encodeURIComponent(id)}`,
      { offset },
      { function: 'get-campaign-details', body: { campaignId: id, offset } },
    );
  }

  create(draft: CampaignDraft): Observable<{ id: string }> {
    return this.api.post('/campaigns', draft, { function: 'create-campaign', body: draft });
  }

  /** Unsafe: may already have started sending, so only a status-0 failure falls back. */
  send(id: string): Observable<SendCampaignResult> {
    return this.api.post(
      `/campaigns/${encodeURIComponent(id)}/send`,
      {},
      { function: 'send-campaign', body: { campaignId: id }, unsafe: true },
    );
  }

  uploadImage(imageBase64: string, contentType: string): Observable<{ url: string }> {
    const body = { imageBase64, contentType };
    return this.api.post('/campaigns/images', body, { function: 'upload-campaign-image', body });
  }

  appUsers(q: AppUsersQuery): Observable<AppUsersPage> {
    const params: Record<string, string | number> = {
      page: q.page,
      pageSize: q.pageSize,
      status: q.status,
    };
    if (q.query) params['query'] = q.query;
    if (q.lastSeenAfter) params['lastSeenAfter'] = q.lastSeenAfter;
    if (q.lastSeenBefore) params['lastSeenBefore'] = q.lastSeenBefore;
    return this.api.get('/app-users', params, { function: 'list-app-users', body: q });
  }

  /** Copies exact signup dates from Firebase Auth into the Users list. Spring only (no Supabase equivalent). */
  syncSignups(): Observable<{ accountsRead: number; rowsWritten: number }> {
    return this.api.post('/app-users/signups/sync', {});
  }

  searchUsers(query: string): Observable<{ users: UserSearchHit[] }> {
    return this.api.get('/app-users/search', { query }, { function: 'list-users', body: { query } });
  }
}
