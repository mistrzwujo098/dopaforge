'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@dopaforge/ui';
import { 
  Zap, 
  Brain, 
  Trophy, 
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Clock,
  BarChart3
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { MobileMenu } from '@/components/navigation/mobile-menu';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Clock,
      title: 'Mikro-zadania',
      description: '2-25 minut. Małe kroki, wielkie zmiany.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Dopaminowe nagrody',
      description: 'System nagród który uzależnia od sukcesu.',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Brain,
      title: 'Psychologia behawioralna',
      description: 'Oparte na nauce o motywacji i nawyków.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Trophy,
      title: 'Gamifikacja',
      description: 'XP, poziomy, odznaki. Praca staje się grą.',
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  const stats = [
    { value: '94%', label: 'skuteczności' },
    { value: '21', label: 'dni do nawyku' },
    { value: '3x', label: 'więcej zadań' },
    { value: '87%', label: 'mniej prokrastynacji' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Minimalist Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800' 
            : ''
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg blur-lg opacity-70" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg p-2">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                DopaForge
              </span>
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Jak to działa
              </a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Funkcje
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Opinie
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                Cennik
              </a>
            </nav>
            
            {/* Desktop CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block"
            >
              <Button
                onClick={() => router.push('/auth')}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
              >
                Rozpocznij za darmo
              </Button>
            </motion.div>
            
            {/* Mobile Menu */}
            <MobileMenu isScrolled={isScrolled} />
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Apple Style */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-cyan-50/50 dark:from-emerald-950/20 dark:to-cyan-950/20" />
        
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Pokonaj prokrastynację raz na zawsze
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight">
              Twój mózg pokocha
              <br />
              być produktywnym
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              DopaForge wykorzystuje dopaminę, aby zamienić nudne zadania w uzależniającą grę. 
              Buduj nawyki bez wysiłku dzięki naukowo opracowanemu systemowi motywacji.
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={() => router.push('/auth')}
                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Zacznij teraz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 rounded-xl"
              >
                Zobacz jak to działa
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Elements */}
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 opacity-20"
          >
            <Brain className="h-24 w-24 text-emerald-500" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-10 opacity-20"
          >
            <Trophy className="h-32 w-32 text-cyan-500" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Tesla Style */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Dlaczego to działa?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Połączenie psychologii, gamifikacji i AI tworzy system, 
              który w końcu pokona prokrastynację.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${feature.gradient.split(' ')[1]} 0%, ${feature.gradient.split(' ')[3]} 100%)`
                  }}
                />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Proste jak 1-2-3
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Zacznij być produktywny w 3 prostych krokach
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Podziel zadanie',
                description: 'Rozbij duże zadania na mikro-kroki (2-25 minut)'
              },
              {
                step: '2',
                title: 'Wykonaj i zdobądź XP',
                description: 'Każde zadanie to punkty doświadczenia i postęp'
              },
              {
                step: '3',
                title: 'Odbierz nagrody',
                description: 'Lootboxy, odznaki i nowe funkcje czekają'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Dołącz do tysięcy produktywnych ludzi
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Anna K.',
                role: 'Programistka',
                content: 'W końcu przestałam odkładać projekty na później. DopaForge sprawił, że praca stała się przyjemnością.',
                rating: 5
              },
              {
                name: 'Michał S.',
                role: 'Student',
                content: 'Sesja? Żaden problem! Dzięki mikro-zadaniom nauka przestała być przytłaczająca.',
                rating: 5
              },
              {
                name: 'Ewa M.',
                role: 'Freelancer',
                content: 'Gamifikacja to strzał w dziesiątkę. Jestem 3x bardziej produktywna niż przed DopaForge.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Prosty cennik
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Zacznij za darmo. Bez karty kredytowej. Bez zobowiązań.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Darmowy</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">0 zł</span>
                <span className="text-gray-600 dark:text-gray-400">/miesiąc</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>5 zadań dziennie</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Podstawowe statystyki</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>System nagród</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/auth')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Rozpocznij za darmo
              </Button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-emerald-600 to-cyan-600 text-white rounded-2xl p-8 shadow-xl transform scale-105"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-semibold">
                Najpopularniejszy
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">29 zł</span>
                <span className="text-white/80">/miesiąc</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>Nieograniczone zadania</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>AI asystent</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>Zaawansowane statystyki</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-white" />
                  <span>Integracje</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/auth')}
                className="w-full bg-white text-emerald-600 hover:bg-gray-100"
                size="lg"
              >
                Wybierz Pro
              </Button>
            </motion.div>

            {/* Team Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4">Zespół</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">99 zł</span>
                <span className="text-gray-600 dark:text-gray-400">/użytkownik</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Wszystko z Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Panel administracyjny</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Raporty zespołowe</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Priorytetowe wsparcie</span>
                </li>
              </ul>
              <Button
                onClick={() => router.push('/auth')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Kontakt
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-cyan-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Gotowy na zmianę?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Dołącz za darmo i przekonaj się, jak łatwo można być produktywnym.
            </p>
            <Button
              size="lg"
              onClick={() => router.push('/auth')}
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Rozpocznij teraz - za darmo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg blur-lg opacity-70" />
                <div className="relative bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg p-2">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                DopaForge
              </span>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Prywatność
              </a>
              <a href="/terms" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Warunki
              </a>
              <a href="/help" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Pomoc
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              © 2024 DopaForge. Wszystkie prawa zastrzeżone.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}