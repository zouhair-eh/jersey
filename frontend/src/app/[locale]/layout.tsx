import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound }    from 'next/navigation';
import { locales, localeDirections, type Locale } from '@/i18n/routing';
import { AuthProvider } from '@/lib/auth-context';
import { CartProvider } from '@/lib/cart-context';
import Navbar           from '@/components/Navbar/Navbar';
import Footer           from '@/components/Footer/Footer';
import { CartDrawer }   from '@/components/Cart';
import SplashScreen    from '@/components/SplashScreen/SplashScreen';
import '../globals.css';


// ── Google Fonts ────────────────────────────────────────────────────────────
/**
 * Inter  → used for LTR locales (en, fr)
 * Cairo  → used for RTL locale (ar) — excellent Arabic/Latin bilingual support
 */
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
});

const cairo = Cairo({
  subsets:  ['arabic', 'latin'],
  variable: '--font-cairo',
  display:  'swap',
});

// ── Dynamic metadata ────────────────────────────────────────────────────────
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'landing.hero' });

  return {
    title: {
      default:  t('welcome_message'),
      template: `%s | Jersey Marocco`,
    },
    description: t('tagline'),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  };
}

// ── Static params (SSG for all locales) ─────────────────────────────────────
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// ── Root Layout ─────────────────────────────────────────────────────────────
export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params:   { locale: string };
}) {
  // Validate that the incoming locale is supported
  if (!locales.includes(locale as Locale)) notFound();

  unstable_setRequestLocale(locale);

  const typedLocale = locale as Locale;
  const dir         = localeDirections[typedLocale]; // 'rtl' | 'ltr'
  const messages    = await getMessages();

  // Choose font based on direction
  const fontVariable = dir === 'rtl' ? cairo.variable : inter.variable;

  return (
    <html
      lang={locale}
      dir={dir}
      className={fontVariable}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <SplashScreen />
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <AuthProvider>
              <Navbar />
              <CartDrawer />
              <div>{children}</div>
              <Footer />
            </AuthProvider>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

