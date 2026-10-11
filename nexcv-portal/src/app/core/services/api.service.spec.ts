import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { Router } from '@angular/router';
import { ApiService, FallbackSpec, PRIMARY_COOLDOWN_MS } from './api.service';
import { AuthService } from './auth.service';

describe('ApiService resilient fallback', () => {
  const primaryUrl = `${environment.apiBaseUrl}/campaigns`;
  const fbUrl = `${environment.supabaseFunctionsUrl}/list-campaigns`;
  const fb: FallbackSpec = { function: 'list-campaigns', body: {} };
  const signOut = vi.fn().mockResolvedValue(undefined);
  const navigateByUrl = vi.fn().mockResolvedValue(true);
  let api: ApiService;
  let http: HttpTestingController;
  let now: number;

  beforeEach(() => {
    now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    signOut.mockClear();
    navigateByUrl.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getIdToken: async () => 'tok', signOut } },
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl } },
      ],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => vi.restoreAllMocks());

  /** The fallback request is issued after an async token fetch. */
  const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0));

  it('returns the unwrapped Spring data on success without touching the fallback', () => {
    let out: unknown;
    api.get('/campaigns', undefined, fb).subscribe((v) => (out = v));
    http.expectOne(primaryUrl).flush({ success: true, data: { campaigns: [] }, message: null });
    expect(out).toEqual({ campaigns: [] });
    http.verify();
  });

  it('falls back on 5xx with the Bearer token and returns the flat body', async () => {
    let out: unknown;
    api.get('/campaigns', undefined, fb).subscribe((v) => (out = v));
    http.expectOne(primaryUrl).flush({}, { status: 503, statusText: 'x' });
    await flushMicrotasks();
    const req = http.expectOne(fbUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
    req.flush({ success: true, campaigns: [1] });
    expect(out).toEqual({ success: true, campaigns: [1] });
  });

  it('falls back on status 0', async () => {
    api.get('/campaigns', undefined, fb).subscribe();
    http.expectOne(primaryUrl).error(new ProgressEvent('error'));
    await flushMicrotasks();
    http.expectOne(fbUrl).flush({ success: true });
  });

  it('does not fall back on 4xx and surfaces the error', () => {
    let status = 0;
    api.get('/campaigns', undefined, fb).subscribe({ error: (e) => (status = e.status) });
    http.expectOne(primaryUrl).flush({ message: 'no' }, { status: 404, statusText: 'x' });
    expect(status).toBe(404);
    http.verify();
  });

  it('opens a 60 s breaker after a primary failure, then retries Spring', async () => {
    api.get('/campaigns', undefined, fb).subscribe();
    http.expectOne(primaryUrl).flush({}, { status: 500, statusText: 'x' });
    await flushMicrotasks();
    http.expectOne(fbUrl).flush({ success: true });

    now += PRIMARY_COOLDOWN_MS - 1;
    api.get('/campaigns', undefined, fb).subscribe();
    await flushMicrotasks();
    http.expectNone(primaryUrl);
    http.expectOne(fbUrl).flush({ success: true });

    now += 2;
    api.get('/campaigns', undefined, fb).subscribe();
    http.expectOne(primaryUrl).flush({ success: true, data: {}, message: null });
  });

  it('does not use the fallback for calls without a descriptor', () => {
    let status = 0;
    api.get('/campaigns').subscribe({ error: (e) => (status = e.status) });
    http.expectOne(primaryUrl).flush({}, { status: 500, statusText: 'x' });
    expect(status).toBe(500);
    http.verify();
  });

  describe('unsafe (send) calls', () => {
    const send: FallbackSpec = { function: 'send-campaign', body: { campaignId: 'c1' }, unsafe: true };
    const sendUrl = `${environment.apiBaseUrl}/campaigns/c1/send`;

    it('does NOT fall back on 5xx', () => {
      let status = 0;
      api.post('/campaigns/c1/send', {}, send).subscribe({ error: (e) => (status = e.status) });
      http.expectOne(sendUrl).flush({}, { status: 504, statusText: 'x' });
      expect(status).toBe(504);
      http.verify();
    });

    it('falls back on status 0', async () => {
      api.post('/campaigns/c1/send', {}, send).subscribe();
      http.expectOne(sendUrl).error(new ProgressEvent('error'));
      await flushMicrotasks();
      http.expectOne(`${environment.supabaseFunctionsUrl}/send-campaign`).flush({ success: true });
    });

    it('still tries Spring while the breaker is open, so a retry gets its 409', () => {
      // Another call trips the breaker.
      api.get('/campaigns', undefined, fb).subscribe();
      http.expectOne(primaryUrl).flush({}, { status: 500, statusText: 'x' });

      let status = 0;
      api.post('/campaigns/c1/send', {}, send).subscribe({ error: (e) => (status = e.status) });
      http.expectOne(sendUrl).flush({ message: 'already sent' }, { status: 409, statusText: 'x' });
      expect(status).toBe(409);
    });
  });

  it('a Supabase 401/403 never triggers logout or access-denied redirects', async () => {
    let status = 0;
    api.get('/campaigns', undefined, fb).subscribe({ error: (e) => (status = e.status) });
    http.expectOne(primaryUrl).flush({}, { status: 500, statusText: 'x' });
    await flushMicrotasks();
    http.expectOne(fbUrl).flush({ error: 'forbidden' }, { status: 403, statusText: 'x' });
    expect(status).toBe(403);
    expect(signOut).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
