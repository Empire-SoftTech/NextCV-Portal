import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { errorInterceptor } from '../interceptors/error.interceptor';
import { AuthService } from './auth.service';
import { ImageUploadService } from './image-upload.service';

describe('ImageUploadService', () => {
  const url = `${environment.supabaseFunctionsUrl}/upload-campaign-image`;
  const signOut = vi.fn().mockResolvedValue(undefined);
  const navigateByUrl = vi.fn().mockResolvedValue(true);
  let service: ImageUploadService;
  let http: HttpTestingController;

  beforeEach(() => {
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
    service = TestBed.inject(ImageUploadService);
    http = TestBed.inject(HttpTestingController);
  });

  const flushMicrotasks = () => new Promise((r) => setTimeout(r, 0));

  it('posts the image straight to the Supabase function with the Firebase token', async () => {
    let out: unknown;
    service.upload('QUJD', 'image/png').subscribe((v) => (out = v));
    await flushMicrotasks();

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
    expect(req.request.body).toEqual({ imageBase64: 'QUJD', contentType: 'image/png' });
    req.flush({ success: true, url: 'https://cdn/x.png' });

    expect(out).toEqual({ success: true, url: 'https://cdn/x.png' });
    http.verify();
  });

  it('a Supabase 401/403 is surfaced to the caller and never logs the admin out', async () => {
    let status = 0;
    service.upload('QUJD', 'image/png').subscribe({ error: (e) => (status = e.status) });
    await flushMicrotasks();

    http.expectOne(url).flush({ error: 'forbidden' }, { status: 403, statusText: 'x' });

    expect(status).toBe(403);
    expect(signOut).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
