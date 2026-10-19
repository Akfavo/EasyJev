import { getDictionary, type Locale } from '@/modules/i18n';

interface FooterProps {
  currentLocale: Locale;
}

export function Footer({ currentLocale }: FooterProps) {
  const dict = getDictionary(currentLocale);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-10 mt-auto">
      <div className="page-container text-center font-mono text-xs sm:text-sm text-muted-page space-y-1">
        <p className="font-semibold text-ink-page">
          {dict.footer.productName} — © {currentYear}
        </p>
        <p className="text-xs text-muted-page">
          {dict.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
