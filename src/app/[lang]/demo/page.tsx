import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  isLocale,
  getDictionary,
  buildMetadata,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/modules/i18n';
import { DemoPlayer } from '@/components/demo/demo-player';

interface DemoPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export function generateStaticParams(): Array<{ lang: Locale }> {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) {
    return {};
  }
  const dict = getDictionary(lang);
  return buildMetadata(lang, process.env.NEXT_PUBLIC_SITE_URL, {
    path: '/demo',
    title: dict.demo.meta.title,
    description: dict.demo.meta.description,
  });
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const tDemo = dict.demo;

  return (
    <div className="w-full pt-6 sm:pt-8 -mb-16 space-y-5 lg:space-y-6">
      {/* 1. Hero with crop marks matching EasyJev's aesthetic */}
      <section
        aria-label={tDemo.title}
        className="relative py-3 sm:py-5 px-6 sm:px-10 text-center border border-dashed border-ink-page/25 rounded-lg mt-2"
      >
        <div className="crop-mark crop-tl" aria-hidden="true" />
        <div className="crop-mark crop-tr" aria-hidden="true" />
        <div className="crop-mark crop-bl" aria-hidden="true" />
        <div className="crop-mark crop-br" aria-hidden="true" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-page leading-[1.1] mb-3 text-balance">
          {tDemo.title}
        </h1>

        <p className="max-w-2xl mx-auto [@media(max-height:700px)]:sr-only text-base sm:text-lg font-medium text-ink-page text-center leading-relaxed text-balance">
          {tDemo.subtitle}
        </p>

        <Link
          href={`/${lang}`}
          aria-label={tDemo.tryAriaLabel}
          className="mt-4 inline-flex items-center justify-center gap-2.5 min-h-[52px] px-9 rounded-pill bg-brand-600 hover:bg-brand-700 text-white font-bold text-base sm:text-lg transition-all shadow-md hover:shadow-lg ring-4 ring-white/70 focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-4"
        >
          <span>{tDemo.tryButton}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </section>

      {/* 2. Interactive Demo Player */}
      <section aria-label={tDemo.title} className="w-full">
        <DemoPlayer currentLocale={lang} />
      </section>
    </div>
  );
}
