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

/** Response of `POST /media/images`. */
export interface UploadedImage {
  url: string;
  contentType: string;
  sizeBytes: number;
}

export interface AppUsersQuery {
  page: number;
  pageSize: number;
  query: string;
  status: AppUserStatus;
  lastSeenAfter: string;
  lastSeenBefore: string;
}

/** Campaign, registered-user and campaign-image endpoints. All of it is the Spring backend. */
@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private readonly api = inject(ApiService);

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

  /**
   * Uploads a campaign image as multipart/form-data (the browser sets the boundary, so no Content-Type is set
   * here). The server decides the real type from the file's contents and returns the public URL to send as
   * the campaign's `imageUrl`.
   */
  uploadImage(file: File): Observable<UploadedImage> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.api.post('/media/images', form);
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
