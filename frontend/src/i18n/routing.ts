/**
 * @file routing.ts
 * @description Typed routing configuration shared between middleware and components.
 *              Import { Link, redirect, usePathname, useRouter } from here
 *              instead of 'next/link' or 'next/navigation' to get locale-aware variants.
 */

import { createNavigation } from 'next-intl/navigation';
import { defineRouting }    from 'next-intl/routing';

export const locales        = ['fr', 'en', 'ar'] as const;
export type  Locale         = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

/** Text direction per locale */
export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  fr: 'ltr',
  en: 'ltr',
  ar: 'rtl',
};

/** Human-readable locale labels for the language switcher */
export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
};

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// createNavigation is the next-intl v3 API that replaces createLocalizedPathnames
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
