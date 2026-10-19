'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { getDictionary, type Locale } from '@/modules/i18n';
import { getModelShortLabel } from '@/modules/claude-client';
import { LanguageSwitcher } from './language-switcher';
import { useAiSettings } from './ai-settings/ai-settings-context';
import { AiSettingsDialog } from './ai-settings/ai-settings-dialog';
import { AboutDialog } from './about/about-dialog';

interface HeaderProps {
  currentLocale: Locale;
}

export function Header({ currentLocale }: HeaderProps) {
  const dict = getDictionary(currentLocale);
  const { state, dispatch } = useAiSettings();
  const aiButtonRef = useRef<HTMLButtonElement>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const pathname = usePathname();

  const tHeader = dict.header;
  const tAi = tHeader.aiSettings;
  const hasKey = state.apiKey.trim().length > 0;
  const modelLabel = getModelShortLabel(state.selectedModel);

  const handleOpenAiSettings = () => {
    dispatch({ type: 'OPEN_DIALOG' });
  };

  // La page de démo s'affiche sans barre de menu : le bouton « Essayer EasyJev » suffit
  if (pathname.replace(/\/$/, '').endsWith('/demo')) {
    return null;
  }

  return (
    <header className="w-full pt-4 sm:pt-6 pb-2">
      <div className="page-container">
        <div className="flex items-center justify-between gap-2 sm:gap-4 py-2 sm:py-2.5 px-3 sm:px-6 bg-white/75 backdrop-blur-md border-2 border-line rounded-pill shadow-[0_4px_16px_rgba(42,27,32,0.08)]">
          <Link
            href={`/${currentLocale}`}
            className="flex items-center gap-2.5 text-lg sm:text-xl font-bold font-pixel tracking-tight text-line hover:text-brand-700 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 rounded-sm"
          >
            <Image
              src="/brand/logo-cubes-96.png"
              alt=""
              width={36}
              height={36}
              className="w-8 h-8 sm:w-9 sm:h-9 shrink-0"
              priority
            />
            <span className="hidden sm:inline">{tHeader.brand}</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <Link
              href={`/${currentLocale}/demo`}
              aria-label={tHeader.howItWorksAriaLabel}
              className="inline-flex items-center min-h-[44px] px-3 sm:px-4 rounded-pill border-2 border-line bg-white hover:bg-surface-2 text-ink hover:text-brand-700 transition-colors cursor-pointer text-xs sm:text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
            >
              <span className="hidden sm:inline">{tHeader.howItWorksButton}</span>
              <span className="sm:hidden">{tHeader.howItWorksShort}</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              aria-haspopup="dialog"
              aria-label={tHeader.aboutAriaLabel}
              className="inline-flex items-center min-h-[44px] px-3 sm:px-4 rounded-pill border-2 border-line bg-white hover:bg-surface-2 text-ink hover:text-brand-700 transition-colors cursor-pointer text-xs sm:text-sm font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
            >
              <span className="hidden sm:inline">{tHeader.aboutButton}</span>
              <span className="sm:hidden">{tHeader.aboutShort}</span>
            </button>

            <button
              ref={aiButtonRef}
              type="button"
              id="ai-settings-trigger"
              onClick={handleOpenAiSettings}
              aria-haspopup="dialog"
              aria-expanded={state.isDialogOpen}
              className="inline-flex items-center gap-2 min-h-[44px] px-3 sm:px-4 rounded-pill bg-line text-white border border-line hover:bg-[#2D252E] transition-all cursor-pointer font-mono text-xs sm:text-sm font-medium shadow-xs focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  hasKey
                    ? 'bg-[#22C55E] shadow-[0_0_6px_#22C55E]'
                    : 'bg-warning-bg shadow-[0_0_4px_#FEEAA2]'
                }`}
                aria-hidden="true"
              />
              <span className="hidden md:inline">{tAi.buttonLabel} ·</span>
              <span className="hidden sm:inline text-xs text-[#D5CED5] font-semibold whitespace-nowrap">
                {hasKey ? `${tAi.keyReady} · ${modelLabel}` : tAi.keyMissing}
              </span>
              <span className="sm:hidden text-xs font-semibold">{tAi.buttonShort}</span>
            </button>

            <LanguageSwitcher
              currentLocale={currentLocale}
              ariaLabel={tHeader.langAriaLabel}
              labels={tHeader.languages}
            />
          </div>
        </div>

        <AiSettingsDialog dict={dict} triggerRef={aiButtonRef} />
        <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} dict={dict} />
      </div>
    </header>
  );
}
