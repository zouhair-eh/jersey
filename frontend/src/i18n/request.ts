import { getRequestConfig } from 'next-intl/server';

/**
 * Server-side i18n request configuration.
 *
 * This file is called once per request on the server.
 * It receives the locale resolved by the middleware and
 * returns the corresponding messages JSON.
 */
export default getRequestConfig(async ({ locale }) => {
  // Dynamically import only the needed locale bundle (code splitting)
  const messages = (await import(`../../messages/${locale}.json`)).default;

  return {
    locale,
    messages,

    // Global date/number formatting defaults per locale
    formats: {
      dateTime: {
        short: {
          day:   'numeric',
          month: 'short',
          year:  'numeric',
        },
      },
      number: {
        currency: {
          style:    'currency',
          currency: 'MAD',
        },
      },
    },
  };
});
