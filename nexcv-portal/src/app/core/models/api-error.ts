import { HttpErrorResponse } from '@angular/common/http';

/** Pulls the backend's ApiResponse `message` out of a failed request, else a fallback. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check your connection.';
    const message = (err.error as { message?: unknown } | null)?.message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}
