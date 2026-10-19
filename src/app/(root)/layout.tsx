import type { ReactNode } from 'react';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#F385A1',
};

export default function RootFallbackLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content="0; url=/en" />
      </head>
      <body>{children}</body>
    </html>
  );
}
