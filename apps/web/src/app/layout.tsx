// path: apps/web/src/app/layout.tsx
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/animations.css';
import { Toaster } from '@/components/toaster';
import { ObservabilityProvider } from '@/components/observability-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dopaforge.com'),
  title: {
    default: 'DopaForge - Zamień prokrastynację w produktywność w 5 minut',
    template: '%s | DopaForge'
  },
  description: 'Buduj nawyki bez wysiłku. System motywacji oparty na dopaminie zamienia nudne zadania w grę, którą pokochasz. Pokonaj prokrastynację z mikro-zadaniami.',
  manifest: '/manifest.json',
  keywords: ['nawyki', 'produktywność', 'dopamina', 'motywacja', 'prokrastynacja', 'gamifikacja', 'micro habits', 'budowanie nawyków', 'zarządzanie czasem', 'pomodoro', 'flow state', 'ADHD produktywność'],
  authors: [{ name: 'DopaForge Team', url: 'https://dopaforge.com' }],
  creator: 'DopaForge',
  publisher: 'DopaForge',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'DopaForge - Twój mózg pokocha być produktywnym',
    description: 'Zamiast walczyć z prokrastynacją, wykorzystaj dopaminę. Micro-taski, nagrody i streaki sprawiają, że sukces staje się uzależniający.',
    url: 'https://dopaforge.com',
    siteName: 'DopaForge',
    locale: 'pl_PL',
    type: 'website',
    images: [
      {
        url: '/screenshot-1.png',
        width: 1200,
        height: 630,
        alt: 'DopaForge - System budowania nawyków oparty na dopaminie',
      },
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'DopaForge Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DopaForge - Produktywność staje się grą',
    description: 'System, który zamienia nudne zadania w dopaminowe hity. Buduj nawyki bawiąc się.',
    images: ['/screenshot-1.png'],
    creator: '@dopaforge',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  category: 'productivity',
  alternates: {
    canonical: 'https://dopaforge.com',
    languages: {
      'pl-PL': 'https://dopaforge.com',
      'en-US': 'https://dopaforge.com/en',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'DopaForge',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'PLN',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '127',
  },
  description: 'DopaForge to aplikacja do budowania nawyków wykorzystująca system dopaminowy. Pokonaj prokrastynację dzieląc zadania na mikro-kroki.',
  screenshot: 'https://dopaforge.com/screenshot-1.png',
  featureList: [
    'Mikro-zadania (2-25 minut)',
    'System nagród dopaminowych',
    'Śledzenie serii dni (streaks)',
    'Gamifikacja produktywności',
    'Wizualizacja przyszłego ja',
    'Cotygodniowe przeglądy',
  ],
  creator: {
    '@type': 'Organization',
    name: 'DopaForge',
    url: 'https://dopaforge.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        <ObservabilityProvider>
          {children}
        </ObservabilityProvider>
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}