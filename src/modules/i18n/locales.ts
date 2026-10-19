export const SUPPORTED_LOCALES = ['fr', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LANG_COOKIE_NAME = 'easyjev_lang';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Construit la chaîne brute du cookie de langue (fonction pure).
 * Format : easyjev_lang=<locale>; Path=/; Max-Age=31536000; SameSite=Lax
 * Avec `secure` (site servi en HTTPS), ajoute « ; Secure ».
 */
export function buildLangCookie(locale: Locale, secure = false): string {
  const base = `${LANG_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  return secure ? `${base}; Secure` : base;
}

/**
 * Enregistre le cookie de langue dans document.cookie (si dans un navigateur).
 * Le cookie est marqué Secure quand la page est servie en HTTPS (pas en local http).
 */
export function setLangCookie(locale: Locale): void {
  if (typeof document !== 'undefined') {
    const isHttps =
      typeof window !== 'undefined' && window.location?.protocol === 'https:';
    document.cookie = buildLangCookie(locale, isHttps);
  }
}
