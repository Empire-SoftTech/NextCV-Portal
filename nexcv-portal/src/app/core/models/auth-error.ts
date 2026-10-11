/** Maps a Firebase Auth sign-in error to something an admin can act on. */
export function signInErrorMessage(err: unknown): string {
  const code = (err as { code?: unknown } | null)?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return (
        'Wrong email or password — or this account has no password. Accounts created with Google ' +
        'sign-in cannot use a password here.'
      );
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is turned off in Firebase Authentication for this project.';
    case 'auth/user-disabled':
      return 'This account has been disabled in Firebase Authentication.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Cannot reach Firebase. Check your connection.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
      return 'The Firebase web API key in this build is not valid.';
    default:
      return typeof code === 'string' ? `Sign-in failed (${code}).` : 'Sign-in failed.';
  }
}
