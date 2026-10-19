import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, getDictionary, SUPPORTED_LOCALES, type Locale } from '@/modules/i18n';
import { interTight, silkscreen, jetbrainsMono } from '@/app/fonts';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SkipLink } from '@/components/skip-link';
import { AiSettingsProvider } from '@/components/ai-settings';
import '@/app/globals.css';

export const viewport: Viewport = {
  themeColor: '#F385A1',
};

interface LangLayoutProps {
  children: ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

export function generateStaticParams(): Array<{ lang: Locale }> {
  return SUPPORTED_LOCALES.map(lang => ({ lang }));
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);

  return (
    <html lang={lang} className={`${interTight.variable} ${silkscreen.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-ink font-sans flex flex-col min-h-screen">
        <SkipLink label={dict.skipLink} targetId="main-content" />
        <AiSettingsProvider>
          <Header currentLocale={lang} />
          <main id="main-content" className="flex-1 w-full">
            <div className="page-container pt-0 pb-28">
              {children}
            </div>
          </main>
          <Footer currentLocale={lang} />
        </AiSettingsProvider>
      </body>
    </html>
  );
}
