import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  const signOut = vi.fn().mockResolvedValue(undefined);
  const navigate = vi.fn().mockResolvedValue(true);
  const navigateByUrl = vi.fn().mockResolvedValue(true);
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    signOut.mockClear();
    navigate.mockClear();
    navigateByUrl.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { signOut } },
        { provide: Router, useValue: { navigate, navigateByUrl } },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  const url = `${environment.apiBaseUrl}/ai/pricing`;

  it('signs out and returns to login on 401', async () => {
    let failed = false;
    http.get(url).subscribe({ error: () => (failed = true) });
    backend.expectOne(url).flush({}, { status: 401, statusText: 'Unauthorized' });
    await Promise.resolve();
    await Promise.resolve();

    expect(failed).toBe(true);
    expect(signOut).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { reason: 'unauthorized' } });
  });

  it('goes to access-denied on 403 without signing out', () => {
    http.get(url).subscribe({ error: () => undefined });
    backend.expectOne(url).flush({}, { status: 403, statusText: 'Forbidden' });

    expect(navigateByUrl).toHaveBeenCalledWith('/access-denied');
    expect(signOut).not.toHaveBeenCalled();
  });

  it('leaves other statuses to the caller', () => {
    http.get(url).subscribe({ error: () => undefined });
    backend.expectOne(url).flush({}, { status: 500, statusText: 'Server Error' });

    expect(navigate).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });

  it('ignores errors from other hosts', () => {
    const other = 'https://example.com/data';
    http.get(other).subscribe({ error: () => undefined });
    backend.expectOne(other).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(signOut).not.toHaveBeenCalled();
  });
});
