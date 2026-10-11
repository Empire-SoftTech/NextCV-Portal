import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Internal, auth-gated admin tool: nothing here benefits from SSR/prerender
 * (no SEO, and every page needs the signed-in user), so every route renders
 * client-side. Prerendering also makes the route extractor walk the wildcard
 * redirects in app.routes.ts.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
