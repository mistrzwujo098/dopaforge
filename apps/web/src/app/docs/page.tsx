'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button
} from '@dopaforge/ui';
import { 
  BookOpen, 
  Rocket, 
  Brain, 
  HelpCircle,
  FileText,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

const docSections = [
  {
    title: 'Szybki Start',
    description: 'DopaForge w 5 minut - wszystko co musisz wiedzieć',
    icon: Rocket,
    href: '/docs/quick-start',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20'
  },
  {
    title: 'Przewodnik po funkcjach',
    description: 'Szczegółowy opis wszystkich możliwości aplikacji',
    icon: FileText,
    href: '/docs/features',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20'
  },
  {
    title: 'Psychologia aplikacji',
    description: 'Dowiedz się dlaczego DopaForge działa',
    icon: Brain,
    href: '/docs/psychology',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20'
  },
  {
    title: 'FAQ',
    description: 'Odpowiedzi na najczęściej zadawane pytania',
    icon: HelpCircle,
    href: '/docs/faq',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20'
  }
];

export default function DocsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-6 sm:p-6 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('navigation.guide')}</h1>
              <p className="text-muted-foreground">{t('navigation.guideDesc')}</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-8"
        >
          {docSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <Link href={section.href}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-lg ${section.bgColor}`}>
                        <section.icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {section.title}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Potrzebujesz więcej pomocy?</CardTitle>
              <CardDescription>
                Skontaktuj się z nami lub dołącz do społeczności
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@dopaforge.com'}
                  className="flex-1"
                >
                  Napisz do supportu
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://discord.gg/dopaforge', '_blank')}
                  className="flex-1"
                >
                  Dołącz do Discord
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/feedback')}
                  className="flex-1"
                >
                  Zgłoś sugestię
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}