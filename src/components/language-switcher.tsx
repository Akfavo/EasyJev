'use client';

import Link from 'next/link';
import { SUPPORTED_LOCALES, setLangCookie, type Locale } from '@/modules/i18n';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  ariaLabel: string;
  labels: Record<Locale, string>;
}

export function LanguageSwitcher({
  currentLocale,
  ariaLabel,
  labels,
}: LanguageSwitcherProps) {
  return (
    <nav aria-label={ariaLabel}>
      <div className="inline-flex items-center rounded-pill bg-white/85 border-[1.5px] border-line p-0.5 min-h-[44px]">
        {SUPPORTED_LOCALES.map(locale => {
          const isActive = locale === currentLocale;
          const accessibleName = labels[locale];

          return (
            <Link
              key={locale}
              href={`/${locale}`}
              onClick={() => setLangCookie(locale)}
              aria-label={accessibleName}
              aria-current={isActive ? 'true' : undefined}
              className={`min-w-[36px] min-h-[38px] px-2 sm:px-3 inline-flex items-center justify-center rounded-pill text-xs font-bold font-mono transition-all focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-1 ${
                isActive
                  ? 'bg-line text-white shadow-xs'
                  : 'text-ink-page hover:text-line'
              }`}
            >
              {locale.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
