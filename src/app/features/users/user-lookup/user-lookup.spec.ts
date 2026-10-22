import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApiService } from '../../../core/services/api.service';
import { UserLookup } from './user-lookup';

const PROFILE = {
  uid: 'u1',
  email: 'a@b.com',
  displayName: 'A B',
  emailVerified: true,
  disabled: false,
  providers: ['password'],
  admin: false,
  createdAt: null,
  lastSignInAt: null,
};
const OVERVIEW = {
  profile: PROFILE,
  credits: [],
  usage: { from: '', to: '', totals: {} },
};
const CREDITS = {
  status: { feature: 'resume_ai_review' },
  adCredits: { granted: 3, used: 1, remaining: 2 },
  tiers: [],
};
const LEDGER = { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0, last: true };

describe('UserLookup', () => {
  const get = vi.fn();
  const post = vi.fn();

  function create(query: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: { get, post } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(query) } } },
      ],
    });
    return TestBed.createComponent(UserLookup).componentInstance;
  }

  beforeEach(() => {
    get.mockReset();
    post.mockReset();
    get.mockImplementation((path: string) => {
      if (path === '/users/lookup') return of(PROFILE);
      if (path.endsWith('/overview')) return of(OVERVIEW);
      if (path.endsWith('/ledger')) return of(LEDGER);
      return of(CREDITS);
    });
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('resolves an email to a uid before loading the overview', async () => {
    const c = create();
    c.searchForm.controls.query.setValue('a@b.com');

    await c.search();

    expect(get).toHaveBeenCalledWith('/users/lookup', { email: 'a@b.com' });
    expect(get).toHaveBeenCalledWith('/users/u1/overview');
    expect(c.overview()?.profile.uid).toBe('u1');
    expect(c.credits()?.adCredits.remaining).toBe(2);
  });

  it('searches by uid directly and encodes it in the path', async () => {
    const c = create();
    c.setSearchBy('uid');
    c.searchForm.controls.query.setValue('a/b c');

    await c.search();

    expect(get).not.toHaveBeenCalledWith('/users/lookup', expect.anything());
    expect(get).toHaveBeenCalledWith('/users/a%2Fb%20c/overview');
  });

  it('auto-searches when opened with a uid query param', async () => {
    const c = create({ uid: 'u1' });
    c.ngOnInit();
    await vi.waitFor(() => expect(c.overview()).not.toBeNull());

    expect(c.searchBy()).toBe('uid');
  });

  it('shows the server message when the user is not found', async () => {
    get.mockImplementation(() => throwError(() => ({ status: 404 })));
    const c = create();
    c.searchForm.controls.query.setValue('ghost@x.com');

    await c.search();

    expect(c.searchError()).toBe('Lookup failed.');
    expect(c.overview()).toBeNull();
  });

  it('sends a negative delta when revoking', async () => {
    const c = create();
    c.searchForm.controls.query.setValue('a@b.com');
    await c.search();
    post.mockReturnValue(of({ granted: 1, used: 1, remaining: 0 }));
    c.adjustForm.patchValue({ direction: 'REVOKE', amount: 2, reason: ' abuse ' });

    await c.adjust();

    expect(post).toHaveBeenCalledWith('/ai/credits/users/u1/adjust', {
      feature: 'resume_ai_review',
      delta: -2,
      reason: 'abuse',
    });
  });

  it('does nothing when the admin cancels the confirmation', async () => {
    const c = create();
    c.searchForm.controls.query.setValue('a@b.com');
    await c.search();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));
    c.adjustForm.patchValue({ reason: 'x' });

    await c.adjust();

    expect(post).not.toHaveBeenCalled();
  });

  it('refuses to submit without a reason', async () => {
    const c = create();
    c.searchForm.controls.query.setValue('a@b.com');
    await c.search();

    await c.adjust();

    expect(post).not.toHaveBeenCalled();
  });
});
