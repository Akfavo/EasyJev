import type { Metadata } from 'next';
import { getDictionary } from './dictionaries';
import type { Locale } from './locales';
import { validateSiteUrl } from './site-url';

export interface AlternateLanguages {
  [key: string]: string;
  fr: string;
  en: string;
  'x-default': string;
}

export function buildAlternateUrls(siteUrl?: string, path: string = ''): AlternateLanguages {
  const validation = validateSiteUrl(siteUrl, process.env.VERCEL_ENV);
  const prefix = validation.normalizedUrl ?? '';
  const suffix = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  return {
    fr: `${prefix}/fr${suffix}`,
    en: `${prefix}/en${suffix}`,
    'x-default': `${prefix}/en${suffix}`,
  };
}

export interface BuildMetadataOptions {
  path?: string;
  title?: string;
  description?: string;
}

export function buildMetadata(
  locale: Locale,
  siteUrl?: string,
  options?: BuildMetadataOptions
): Metadata {
  const dict = getDictionary(locale);
  const alternates = buildAlternateUrls(siteUrl, options?.path ?? '');

  return {
    title: options?.title ?? dict.meta.title,
    description: options?.description ?? dict.meta.description,
    alternates: {
      canonical: locale === 'fr' ? alternates.fr : alternates.en,
      languages: alternates,
    },
  };
}
