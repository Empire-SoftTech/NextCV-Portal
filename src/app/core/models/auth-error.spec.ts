import { signInErrorMessage } from './auth-error';

describe('signInErrorMessage', () => {
  it('explains a bad credential, including the Google-only case', () => {
    const msg = signInErrorMessage({ code: 'auth/invalid-credential' });
    expect(msg).toContain('Wrong email or password');
    expect(msg).toContain('Google');
  });

  it('flags a disabled email/password provider', () => {
    expect(signInErrorMessage({ code: 'auth/operation-not-allowed' })).toContain('turned off');
  });

  it('includes the code for anything unrecognised', () => {
    expect(signInErrorMessage({ code: 'auth/something-new' })).toBe('Sign-in failed (auth/something-new).');
  });

  it('copes with a non-Firebase error', () => {
    expect(signInErrorMessage(new Error('boom'))).toBe('Sign-in failed.');
    expect(signInErrorMessage(null)).toBe('Sign-in failed.');
  });
});
