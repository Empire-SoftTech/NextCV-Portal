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
import { ImageUploadService } from './image-upload.service';

export interface AppUsersQuery {
  page: number;
  pageSize: number;
  query: string;
  status: AppUserStatus;
  lastSeenAfter: string;
  lastSeenBefore: string;
}

/** Campaign + registered-user endpoints (Spring). Image upload is the one call that goes to Supabase. */
@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private readonly api = inject(ApiService);
  private readonly images = inject(ImageUploadService);

  list(): Observable<{ campaigns: CampaignRow[] }> {
    return this.api.get('/campaigns');
  }

  details(id: string, offset: number): Observable<CampaignDetails> {
    return this.api.get(`/campaigns/${encodeURIComponent(id)}`, { offset });
  }

  create(draft: CampaignDraft): Observable<{ id: string }> {
    return this.api.post('/campaigns', draft);
  }

  send(id: string): Observable<SendCampaignResult> {
    return this.api.post(`/campaigns/${encodeURIComponent(id)}/send`, {});
  }

  uploadImage(imageBase64: string, contentType: string): Observable<{ url: string }> {
    return this.images.upload(imageBase64, contentType);
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
    return this.api.get('/app-users', params);
  }

  /** Copies exact signup dates from Firebase Auth into the Users list. */
  syncSignups(): Observable<{ accountsRead: number; rowsWritten: number }> {
    return this.api.post('/app-users/signups/sync', {});
  }

  searchUsers(query: string): Observable<{ users: UserSearchHit[] }> {
    return this.api.get('/app-users/search', { query });
  }
}
