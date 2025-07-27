import type { Metadata } from 'next';
import Link from 'next/link';
import { Button, Card, CardContent } from '@dopaforge/ui';
import { Zap, Trophy, Target, Brain, Sparkles, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

const DynamicFAQSection = dynamic(
  () => import('@/components/faq-section').then((mod) => ({ default: mod.FAQSection })),
  {
    ssr: false,
    loading: () => (
      <div className="container mx-auto px-4 py-16">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'DopaForge - System produktywności oparty na dopaminie',
  description: 'Pokonaj prokrastynację w 5 minut dziennie. DopaForge wykorzystuje neuronaukę i gamifikację, aby zamienić nudne zadania w uzależniającą grę.',
  openGraph: {
    title: 'DopaForge - Twój mózg pokocha produktywność',
    description: 'System mikro-nawyków który wykorzystuje dopaminę do budowania trwałych nawyków. Dołącz do 1000+ użytkowników którzy pokonali prokrastynację.',
  },
};

const features = [
  {
    icon: Brain,
    title: 'Nauka o mózgu',
    description: 'Wykorzystujemy najnowsze odkrycia neurobiologii do hackowania systemu nagrody w mózgu',
  },
  {
    icon: Target,
    title: 'Mikro-zadania',
    description: 'Rozbij wielkie cele na małe kroki (2-25 min) które dają natychmiastową satysfakcję',
  },
  {
    icon: Trophy,
    title: 'System nagród',
    description: 'Zdobywaj XP, odznaki i nagrody za każde ukończone zadanie - jak w grze RPG',
  },
  {
    icon: Sparkles,
    title: 'Dopaminowe pętle',
    description: 'Tworzymy pozytywne pętle zwrotne które sprawiają, że produktywność staje się przyjemna',
  },
  {
    icon: Clock,
    title: 'Tylko 5 minut',
    description: 'Zacznij od 5 minut dziennie. To wszystko czego potrzebujesz aby zbudować nawyk',
  },
  {
    icon: Zap,
    title: 'Natychmiastowe wyniki',
    description: 'Poczuj różnicę już pierwszego dnia. Bez długich kursów i teorii',
  },
];

const jsonLdHomepage = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
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
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHomepage) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <header className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Twój mózg pokocha być produktywnym
            </h1>
            <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8">
              Zamień prokrastynację w produktywność w 5 minut. 
              System oparty na dopaminie który sprawia, że sukces staje się uzależniający.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" variant="gradient" className="text-lg px-8 py-6">
                  Zacznij za darmo
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Przejdź do aplikacji
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Bez karty kredytowej • Bez instalacji • Działa w przeglądarce
            </p>
          </div>
        </header>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Jak DopaForge hackuje Twój mózg
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-emerald-600 dark:text-emerald-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            Dołącz do 1000+ osób które pokonały prokrastynację
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">92%</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                użytkowników tworzy nawyk w 21 dni
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">15min</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                średni czas skupienia wzrasta 3x
              </p>
            </div>
            <div>
              <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400">4.8★</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                ocena od 127 użytkowników
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <DynamicFAQSection />

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-12 text-white max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Gotowy na zmianę? Zacznij teraz
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Pierwsze 7 dni całkowicie za darmo. Bez zobowiązań.
            </p>
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Rozpocznij transformację →
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 DopaForge. Wszystkie prawa zastrzeżone.</p>
        </footer>
      </div>
    </>
  );
}