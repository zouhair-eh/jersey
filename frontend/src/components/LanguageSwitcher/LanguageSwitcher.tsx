'use client';

/**
 * @file LanguageSwitcher.tsx
 * @description Animated locale-aware language switcher for jersey_marocco.
 *
 * Features:
 *  - Displays a dropdown with FR / EN / AR options
 *  - Switches route locale using next-intl's locale-aware router
 *  - Highlights the currently active locale
 *  - Uses CSS custom properties to animate open/close smoothly
 *  - Fully accessible (keyboard nav, aria labels)
 */

import { useTransition, useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations }                 from 'next-intl';
import { useRouter, usePathname }                     from '@/i18n/routing';
import { locales, localeLabels, localeDirections, type Locale } from '@/i18n/routing';
import styles from './LanguageSwitcher.module.css';

// ── Locale flag / icon mapping ───────────────────────────────────────────────
const LOCALE_FLAGS: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  ar: '🇲🇦',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function LanguageSwitcher() {
  const t              = useTranslations('nav');
  const locale         = useLocale() as Locale;
  const router         = useRouter();
  const pathname       = usePathname();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen]         = useState(false);
  const containerRef                = useRef<HTMLDivElement>(null);

  // ── Close dropdown when clicking outside ──────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Close on Escape key ────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Locale switch handler ──────────────────────────────────────────────────
  function switchLocale(nextLocale: Locale) {
    setIsOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      ref={containerRef}
      className={styles.wrapper}
      data-pending={isPending || undefined}
    >
      {/* Trigger button */}
      <button
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('language_switcher_label')}
      >
        <span className={styles.flag} aria-hidden="true">
          {LOCALE_FLAGS[locale]}
        </span>
        <span className={styles.currentLabel}>
          {localeLabels[locale]}
        </span>
        <span
          className={styles.chevron}
          data-open={isOpen || undefined}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <ul
          role="listbox"
          aria-label={t('language_switcher_label')}
          className={styles.dropdown}
        >
          {locales.map((loc) => {
            const isActive = loc === locale;
            const isRTL    = localeDirections[loc] === 'rtl';

            return (
              <li key={loc} role="option" aria-selected={isActive}>
                <button
                  className={styles.option}
                  data-active={isActive || undefined}
                  data-rtl={isRTL || undefined}
                  onClick={() => switchLocale(loc)}
                  disabled={isActive}
                >
                  <span className={styles.flag} aria-hidden="true">
                    {LOCALE_FLAGS[loc]}
                  </span>
                  <span className={styles.optionLabel}>
                    {localeLabels[loc]}
                  </span>
                  {isActive && (
                    <span className={styles.activeCheck} aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {isRTL && (
                    <span className={styles.rtlBadge} aria-label="Right to left language">
                      RTL
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Loading overlay during transition */}
      {isPending && <span className={styles.pendingSpinner} aria-hidden="true" />}
    </div>
  );
}
