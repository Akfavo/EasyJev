import type { Locale } from './locales';
import { fr, type Dictionary } from './fr';
import { en } from './en';

const dictionaries: Record<Locale, Dictionary> = {
  fr,
  en,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
