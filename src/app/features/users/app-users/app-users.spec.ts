import { lastActiveCutoffs } from './app-users';

describe('lastActiveCutoffs', () => {
  const now = new Date('2026-10-11T15:30:00Z');

  it('applies no bounds for "any"', () => {
    expect(lastActiveCutoffs('any', now)).toEqual({ lastSeenAfter: '', lastSeenBefore: '' });
  });

  it('"today" starts at UTC midnight and is a full ISO instant (Spring rejects date-only)', () => {
    expect(lastActiveCutoffs('today', now)).toEqual({
      lastSeenAfter: '2026-10-11T00:00:00.000Z',
      lastSeenBefore: '',
    });
  });

  it('"7d" and "30d" look back from today', () => {
    expect(lastActiveCutoffs('7d', now).lastSeenAfter).toBe('2026-10-04T00:00:00.000Z');
    expect(lastActiveCutoffs('30d', now).lastSeenAfter).toBe('2026-09-11T00:00:00.000Z');
  });

  it('"inactive30" bounds last seen from above', () => {
    expect(lastActiveCutoffs('inactive30', now)).toEqual({
      lastSeenAfter: '',
      lastSeenBefore: '2026-09-11T00:00:00.000Z',
    });
  });
});
