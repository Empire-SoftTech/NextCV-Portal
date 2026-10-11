import { HttpErrorResponse } from '@angular/common/http';

/** Pulls the backend's ApiResponse `message` out of a failed request, else a fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check your connection.';
    // Spring envelope uses `message`; Supabase functions may use `error`.
    const body = err.error as { message?: unknown; error?: unknown } | null;
    if (typeof body?.message === 'string' && body.message.length > 0) return body.message;
    if (typeof body?.error === 'string' && body.error.length > 0) return body.error;
  }
  return fallback;
}
