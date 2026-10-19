import { DONATION_URL } from '@/config';
import type { Dictionary } from '@/modules/i18n';

interface DonationCardProps {
  dict: Dictionary;
}

export function DonationCard({ dict }: DonationCardProps) {
  // Règle stricte : la carte et son lien ne sont rendus QUE si DONATION_URL est non vide.
  if (!DONATION_URL || DONATION_URL.trim() === '') {
    return null;
  }

  const tDonate = dict.donate;

  return (
    <section
      aria-label={tDonate.title}
      className="w-full bg-white/85 backdrop-blur-md border-2 border-line rounded-win p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(42,27,32,0.06)]"
    >
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-ink">
          {tDonate.title}
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
          {tDonate.description}
        </p>
      </div>

      <a
        href={DONATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={tDonate.ariaLabel}
        className="min-h-[44px] px-5 py-2.5 inline-flex items-center justify-center rounded-pill bg-brand-600 hover:bg-brand-700 active:bg-brand-700 text-white font-bold text-sm transition-colors cursor-pointer shrink-0 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{tDonate.button}</span>
      </a>
    </section>
  );
}
