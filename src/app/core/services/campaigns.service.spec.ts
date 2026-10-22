import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CampaignsService } from './campaigns.service';

describe('CampaignsService.uploadImage', () => {
  let service: CampaignsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CampaignsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the file as multipart to the Spring media endpoint and unwraps the envelope', () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'hero.png', { type: 'image/png' });
    let out: unknown;

    service.uploadImage(file).subscribe((v) => (out = v));

    const req = http.expectOne(`${environment.apiBaseUrl}/media/images`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('file')).toBeInstanceOf(File);
    expect(((req.request.body as FormData).get('file') as File).name).toBe('hero.png');
    // No explicit Content-Type: the browser must add the multipart boundary itself.
    expect(req.request.headers.has('Content-Type')).toBe(false);
    req.flush({
      success: true,
      data: { url: 'https://api.example.com/api/v1/media/images/x.png', contentType: 'image/png', sizeBytes: 3 },
      message: null,
    });

    expect(out).toEqual({
      url: 'https://api.example.com/api/v1/media/images/x.png',
      contentType: 'image/png',
      sizeBytes: 3,
    });
  });
});
