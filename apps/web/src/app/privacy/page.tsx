'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@dopaforge/ui';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Mail, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

export default function PrivacyPage() {
  const router = useRouter();
  const lastUpdated = '15 grudnia 2023';

  const sections = [
    {
      icon: Shield,
      title: 'Bezpieczeństwo Twoich danych',
      content: `Twoja prywatność jest dla nas priorytetem. Stosujemy najnowsze standardy bezpieczeństwa, w tym szyfrowanie SSL/TLS dla wszystkich połączeń oraz bezpieczne hashowanie haseł. Twoje dane są chronione zgodnie z najlepszymi praktykami branżowymi.`
    },
    {
      icon: Database,
      title: 'Jakie dane zbieramy',
      content: `Zbieramy tylko niezbędne dane:
      • Email i hasło (do logowania)
      • Dane o zadaniach i postępach
      • Preferencje aplikacji
      • Podstawowe dane analityczne (anonimowe)
      
      NIE zbieramy: danych osobowych niezwiązanych z funkcjonowaniem aplikacji, danych lokalizacyjnych, danych z innych aplikacji.`
    },
    {
      icon: Eye,
      title: 'Jak wykorzystujemy dane',
      content: `Twoje dane wykorzystujemy wyłącznie do:
      • Umożliwienia korzystania z aplikacji
      • Personalizacji doświadczenia
      • Poprawy jakości usług
      • Komunikacji związanej z kontem
      
      Nigdy nie sprzedajemy Twoich danych osobom trzecim.`
    },
    {
      icon: UserCheck,
      title: 'Twoje prawa',
      content: `Masz pełną kontrolę nad swoimi danymi:
      • Dostęp - możesz zobaczyć wszystkie swoje dane
      • Eksport - możesz pobrać swoje dane
      • Usunięcie - możesz trwale usunąć konto
      • Sprostowanie - możesz poprawić swoje dane
      • Ograniczenie przetwarzania - możesz ograniczyć sposób użycia`
    },
    {
      icon: Lock,
      title: 'Udostępnianie danych',
      content: `Twoje dane mogą być udostępnione tylko:
      • Dostawcom usług (hosting, email) - z zachowaniem poufności
      • Na Twoje wyraźne żądanie
      • W przypadku wymogów prawnych
      
      Wszyscy partnerzy są zobowiązani do ochrony Twoich danych.`
    },
    {
      icon: Mail,
      title: 'Kontakt',
      content: `Masz pytania dotyczące prywatności?
      
      Email: privacy@dopaforge.com
      Inspektor Ochrony Danych: iod@dopaforge.com
      
      Odpowiadamy w ciągu 48 godzin.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-6 sm:p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{t('legal.privacyTitle')}</h1>
          <p className="text-muted-foreground">
            {t('legal.lastUpdated', { date: lastUpdated })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg">
                  DopaForge szanuje Twoją prywatność i zobowiązuje się do ochrony Twoich danych osobowych. 
                  Ta polityka prywatności wyjaśnia, jakie dane zbieramy, jak je wykorzystujemy i jakie masz prawa.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-3">Pliki cookies</h3>
                <p className="text-sm">
                  Używamy tylko niezbędnych plików cookies do:
                  • Zapamiętania sesji logowania
                  • Zapisania preferencji użytkownika
                  • Analizy ruchu (anonimowo)
                </p>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">Zmiany w polityce</h3>
                <p className="text-sm">
                  Możemy aktualizować tę politykę. O istotnych zmianach poinformujemy emailem.
                  Kontynuowanie korzystania z aplikacji oznacza akceptację zmian.
                </p>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">Podstawa prawna</h3>
                <p className="text-sm">
                  Przetwarzamy dane zgodnie z RODO na podstawie:
                  • Zgody (art. 6 ust. 1 lit. a)
                  • Umowy (art. 6 ust. 1 lit. b)
                  • Prawnie uzasadnionego interesu (art. 6 ust. 1 lit. f)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}