import createMiddleware from 'next-intl/middleware';
import { routing }      from './i18n/routing';

/**
 * next-intl routing middleware (v3).
 *
 * - Requests to `/`           → redirected to `/fr` (default locale)
 * - Requests to `/fr/catalog` → served normally
 * - Requests to `/ar/catalog` → served with RTL layout
 * - Unknown locales           → redirected to default locale
 *
 * Using the shared `routing` object keeps locale config in ONE place.
 */
export default createMiddleware(routing);

export const config = {
  // Run middleware on all paths EXCEPT Next.js internals and static files
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
  ],
};
