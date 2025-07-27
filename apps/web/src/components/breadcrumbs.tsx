'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  dashboard: 'Panel główny',
  settings: 'Ustawienia',
  auth: 'Logowanie',
  focus: 'Skupienie',
  setup: 'Konfiguracja',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Strona główna',
        item: 'https://dopaforge.com',
      },
      ...segments.map((segment, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: routeLabels[segment] || segment,
        item: `https://dopaforge.com/${segments.slice(0, index + 1).join('/')}`,
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100 flex items-center">
          <Home className="h-4 w-4" />
          <span className="sr-only">Strona główna</span>
        </Link>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const label = routeLabels[segment] || segment;

          return (
            <div key={segment} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1" />
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
              ) : (
                <Link href={href} className="hover:text-gray-900 dark:hover:text-gray-100">
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}