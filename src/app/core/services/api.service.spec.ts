import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('unwraps the ApiResponse envelope on GET and sends query params', () => {
    let out: unknown;
    api.get('/campaigns', { offset: 20 }).subscribe((v) => (out = v));

    const req = http.expectOne(`${environment.apiBaseUrl}/campaigns?offset=20`);
    req.flush({ success: true, data: { campaigns: [] }, message: null });

    expect(out).toEqual({ campaigns: [] });
  });

  it('unwraps the envelope on POST and sends the body', () => {
    let out: unknown;
    api.post('/campaigns', { title: 't' }).subscribe((v) => (out = v));

    const req = http.expectOne(`${environment.apiBaseUrl}/campaigns`);
    expect(req.request.body).toEqual({ title: 't' });
    req.flush({ success: true, data: { id: 'c1' }, message: null });

    expect(out).toEqual({ id: 'c1' });
  });

  it('surfaces server errors as they are: Spring is the only backend, there is no fallback', () => {
    let status = 0;
    api.get('/campaigns').subscribe({ error: (e: HttpErrorResponse) => (status = e.status) });

    http.expectOne(`${environment.apiBaseUrl}/campaigns`).flush({}, { status: 503, statusText: 'x' });

    expect(status).toBe(503);
  });
});
