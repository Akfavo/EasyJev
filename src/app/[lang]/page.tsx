import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  isLocale,
  getDictionary,
  buildMetadata,
  SUPPORTED_LOCALES,
  type Locale,
} from '@/modules/i18n';
import { Editor } from '@/components/editor/editor';
import { DonationCard } from '@/components/donate/donation-card';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export function generateStaticParams(): Array<{ lang: Locale }> {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) {
    return {};
  }
  return buildMetadata(lang, process.env.NEXT_PUBLIC_SITE_URL);
}

export default async function Page({ params }: PageProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);

  return (
    <div className="w-full space-y-8 lg:space-y-10">
      {/* 1. Hero monumental avec repères de coupe */}
      <section
        aria-label={dict.home.title}
        className="relative py-6 sm:py-8 px-6 sm:px-10 text-center border border-dashed border-ink-page/25 rounded-lg mt-2"
      >
        <div className="crop-mark crop-tl" aria-hidden="true" />
        <div className="crop-mark crop-tr" aria-hidden="true" />
        <div className="crop-mark crop-bl" aria-hidden="true" />
        <div className="crop-mark crop-br" aria-hidden="true" />

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ink-page leading-[1.08] mb-3 text-balance">
          {dict.home.title.split('.').filter(Boolean).map((part, index, arr) => (
            <span key={index}>
              {part.trim()}
              <span className="text-brand-600">.</span>
              {index < arr.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>

        <p className="max-w-2xl mx-auto mt-3 text-base sm:text-lg lg:text-xl font-medium text-ink-page text-center leading-snug text-balance">
          {dict.home.pitch.heroLine}
        </p>
      </section>

      {/* 2. Éditeur interactif en trois temps (les explications et les encadrés de confiance sont dans « À propos », en-tête) */}
      <Editor currentLocale={lang} />

      {/* 3. Carte de dons sobre */}
      <DonationCard dict={dict} />
    </div>
  );
}
