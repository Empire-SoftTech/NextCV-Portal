import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Campaign hero images go straight to the Supabase `upload-campaign-image` Edge Function; it is the only
 * thing in the portal that still talks to Supabase. Everything else uses Spring (ApiService).
 *
 * The auth/error interceptors only act on `apiBaseUrl`, so a 401/403 here surfaces to the caller and never
 * logs the admin out or redirects.
 */
@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  upload(imageBase64: string, contentType: string): Observable<{ url: string }> {
    return from(this.auth.getIdToken()).pipe(
      switchMap((token) =>
        this.http.post<{ url: string }>(
          `${environment.supabaseFunctionsUrl}/upload-campaign-image`,
          { imageBase64, contentType },
          { headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined },
        ),
      ),
    );
  }
}
