import type { Dictionary } from '@/modules/i18n';

interface TrustCardsProps {
  dict: Dictionary;
  /** Remplace la grille par défaut (par exemple deux colonnes dans la fenêtre « À propos »). */
  gridClassName?: string;
}

export function TrustCards({ dict, gridClassName }: TrustCardsProps) {
  const tTrust = dict.trust;

  return (
    <section
      aria-label={tTrust.sectionAriaLabel}
      className={gridClassName ?? 'w-full grid grid-cols-1 md:grid-cols-2 min-[1280px]:grid-cols-4 gap-4'}
    >
      {/* Encadré 1 : Où vont tes données ? */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-line rounded-win p-6 sm:p-7 space-y-4 shadow-[0_4px_16px_rgba(42,27,32,0.06)]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-control bg-brand-100 text-brand-600 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
            {tTrust.data.title}
          </h2>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-muted list-none pl-0 leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.data.item1}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.data.item2}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.data.item3}</span>
          </li>
        </ul>
      </div>

      {/* Encadré 2 : Où va ma clé ? */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-line rounded-win p-6 sm:p-7 space-y-4 shadow-[0_4px_16px_rgba(42,27,32,0.06)]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-control bg-brand-100 text-brand-600 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
            {tTrust.key.title}
          </h2>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-muted list-none pl-0 leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.key.item1}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.key.item2}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.key.item3}</span>
          </li>
        </ul>
      </div>

      {/* Encadré 3 : Ce qu'EasyJev ne fait pas */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-line rounded-win p-6 sm:p-7 space-y-4 shadow-[0_4px_16px_rgba(42,27,32,0.06)]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-control bg-surface-2 text-ink shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
            {tTrust.boundaries.title}
          </h2>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-muted list-none pl-0 leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-control-border shrink-0 mt-2" />
            <span>{tTrust.boundaries.item1}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-control-border shrink-0 mt-2" />
            <span>{tTrust.boundaries.item2}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-control-border shrink-0 mt-2" />
            <span>{tTrust.boundaries.item3}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-control-border shrink-0 mt-2" />
            <span>{tTrust.boundaries.item4}</span>
          </li>
        </ul>
      </div>

      {/* Encadré 4 : Ce que nous te conseillons */}
      <div className="bg-white/85 backdrop-blur-md border-2 border-line rounded-win p-6 sm:p-7 space-y-4 shadow-[0_4px_16px_rgba(42,27,32,0.06)]">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-control bg-brand-100 text-brand-600 shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </span>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-ink">
            {tTrust.recommendations.title}
          </h2>
        </div>

        <ul className="space-y-2.5 text-xs sm:text-sm text-muted list-none pl-0 leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.recommendations.item1}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.recommendations.item2}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.recommendations.item3}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 shrink-0 mt-2" />
            <span>{tTrust.recommendations.item4}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
