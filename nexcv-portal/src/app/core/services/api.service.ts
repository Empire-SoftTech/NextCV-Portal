import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

/**
 * Describes the Supabase Edge Function equivalent of a Spring call.
 * `unsafe` marks calls that may have side effects before failing (e.g. sending a push):
 * those fall back only on status 0 (never connected), never on 5xx.
 */
export interface FallbackSpec {
  function: string;
  body: unknown;
  unsafe?: boolean;
}

/** After a primary failure, Spring is skipped for this long. */
export const PRIMARY_COOLDOWN_MS = 60_000;

/** The only place components call HTTP — unwraps the backend's ApiResponse<T> envelope. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly fallbackUrl = environment.supabaseFunctionsUrl;
  private primarySkippedUntil = 0;

  get<T>(
    path: string,
    params?: Record<string, string | number>,
    fallback?: FallbackSpec,
  ): Observable<T> {
    return this.withFallback(
      () =>
        this.http
          .get<ApiResponse<T>>(`${this.baseUrl}${path}`, {
            params: new HttpParams({ fromObject: params ?? {} }),
          })
          .pipe(map((res) => res.data)),
      fallback,
    );
  }

  post<T>(path: string, body: unknown, fallback?: FallbackSpec): Observable<T> {
    return this.withFallback(
      () =>
        this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(map((res) => res.data)),
      fallback,
    );
  }

  /**
   * Spring is primary. Falls back to the Supabase function ONLY on a network error (status 0)
   * or HTTP 5xx — never on 4xx — and a primary failure opens a 60 s circuit breaker.
   */
  private withFallback<T>(primary: () => Observable<T>, fallback?: FallbackSpec): Observable<T> {
    if (!fallback) return primary();
    // Unsafe calls (send) always try Spring first: a retry then gets Spring's 409 instead of
    // risking a duplicate send on Supabase, whose data Spring cannot see.
    if (!fallback.unsafe && Date.now() < this.primarySkippedUntil) return this.callFallback<T>(fallback);
    return primary().pipe(
      catchError((err: unknown) => {
        if (!(err instanceof HttpErrorResponse) || !(err.status === 0 || err.status >= 500)) {
          return throwError(() => err);
        }
        this.primarySkippedUntil = Date.now() + PRIMARY_COOLDOWN_MS;
        if (fallback.unsafe && err.status !== 0) return throwError(() => err);
        return this.callFallback<T>(fallback);
      }),
    );
  }

  /**
   * The auth/error interceptors only act on apiBaseUrl, so this request is untouched by them:
   * a Supabase 401/403 is surfaced to the caller and never logs the admin out.
   */
  private callFallback<T>(fallback: FallbackSpec): Observable<T> {
    return from(this.authService.getIdToken()).pipe(
      switchMap((token) =>
        this.http.post<T>(`${this.fallbackUrl}/${fallback.function}`, fallback.body, {
          headers: token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined,
        }),
      ),
    );
  }
}
