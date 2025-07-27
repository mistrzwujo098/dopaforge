import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@dopaforge/ui';
import { Home, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Strona nie znaleziona - 404',
  description: 'Przepraszamy, ale strona której szukasz nie istnieje. Wróć do DopaForge i kontynuuj budowanie produktywnych nawyków.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4">
          Ups! Strona nie znaleziona
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Wygląda na to, że ta strona zrobiła sobie przerwę. 
          Może czas wrócić do budowania nawyków?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="gradient" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Strona główna
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Panel główny
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}