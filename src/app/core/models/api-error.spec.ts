import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './api-error';

describe('apiErrorMessage', () => {
  it('uses the backend message when present', () => {
    const err = new HttpErrorResponse({ status: 422, error: { message: 'Resume is empty.' } });
    expect(apiErrorMessage(err, 'fallback')).toBe('Resume is empty.');
  });

  it('reports an unreachable server for status 0', () => {
    const err = new HttpErrorResponse({ status: 0 });
    expect(apiErrorMessage(err, 'fallback')).toContain('Cannot reach the server');
  });

  it('falls back when there is no message', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 500, error: null }), 'fallback')).toBe('fallback');
    expect(apiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
