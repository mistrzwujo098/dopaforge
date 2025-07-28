'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@dopaforge/ui';
import { ArrowLeft, FileText, Users, Ban, CreditCard, AlertTriangle, Scale } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';

export default function TermsPage() {
  const router = useRouter();
  const lastUpdated = '15 grudnia 2023';

  const sections = [
    {
      icon: FileText,
      title: 'Definicje i akceptacja',
      content: `Korzystając z DopaForge ("Aplikacja", "Usługa"), akceptujesz niniejszy regulamin. 
      
      Definicje:
      • "Użytkownik" - osoba korzystająca z Aplikacji
      • "Konto" - indywidualne konto w Aplikacji
      • "Treści" - wszystkie dane wprowadzone przez Użytkownika
      • "Usługi" - wszystkie funkcje oferowane przez DopaForge`
    },
    {
      icon: Users,
      title: 'Korzystanie z usługi',
      content: `Możesz korzystać z DopaForge jeśli:
      • Masz co najmniej 13 lat (lub wiek zgody w Twoim kraju)
      • Podajesz prawdziwe dane przy rejestracji
      • Używasz Aplikacji zgodnie z prawem
      • Nie naruszasz praw innych użytkowników
      
      Jedno konto per osoba. Jesteś odpowiedzialny za bezpieczeństwo swojego hasła.`
    },
    {
      icon: Ban,
      title: 'Niedozwolone użycie',
      content: `Zabronione jest:
      • Hackowanie, łamanie zabezpieczeń
      • Spamowanie, automatyzacja bez zgody
      • Podszywanie się pod innych
      • Rozpowszechnianie szkodliwych treści
      • Wykorzystywanie błędów aplikacji
      • Odwrotna inżynieria kodu
      
      Naruszenie skutkuje natychmiastowym zablokowaniem konta.`
    },
    {
      icon: CreditCard,
      title: 'Płatności i subskrypcje',
      content: `Obecnie DopaForge jest darmowy (wersja beta).
      
      W przyszłości:
      • Podstawowa wersja pozostanie darmowa
      • Funkcje premium w modelu subskrypcyjnym
      • Płatności przez bezpieczne systemy
      • Możliwość anulowania w każdej chwili
      • Brak ukrytych opłat
      
      O zmianach poinformujemy z 30-dniowym wyprzedzeniem.`
    },
    {
      icon: AlertTriangle,
      title: 'Ograniczenie odpowiedzialności',
      content: `DopaForge jest dostarczany "jak jest":
      • Nie gwarantujemy nieprzerwanego działania
      • Nie odpowiadamy za utratę danych (rób backupy!)
      • Nie zastępujemy profesjonalnej pomocy psychologicznej
      • Nie gwarantujemy konkretnych rezultatów
      
      Korzystasz na własną odpowiedzialność. Nasza odpowiedzialność ograniczona jest do wysokości opłat.`
    },
    {
      icon: Scale,
      title: 'Własność intelektualna',
      content: `Twoje dane:
      • Pozostają Twoją własnością
      • Udzielasz nam licencji do ich przetwarzania
      • Możesz je eksportować i usunąć
      
      Nasza własność:
      • Kod aplikacji, design, logo
      • Treści tworzone przez nas
      • Algorytmy i metody działania
      
      Szanujemy wzajemnie swoją własność.`
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
          
          <h1 className="text-3xl font-bold mb-2">{t('legal.termsTitle')}</h1>
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
                  Witaj w DopaForge! Te warunki korzystania ("Regulamin") określają zasady korzystania z naszej aplikacji. 
                  Przeczytaj uważnie - korzystając z DopaForge, zgadzasz się na te warunki.
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
                <h3 className="text-lg font-semibold mb-3">Rozwiązywanie sporów</h3>
                <p className="text-sm">
                  W przypadku sporów:
                  • Najpierw spróbujemy rozwiązać polubownie
                  • Mediacja jako drugi krok
                  • Sąd właściwy dla siedziby DopaForge
                  • Prawo polskie jako obowiązujące
                </p>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">Zmiany regulaminu</h3>
                <p className="text-sm">
                  Możemy zmieniać regulamin. O istotnych zmianach poinformujemy:
                  • Emailem na 30 dni przed wejściem w życie
                  • Powiadomieniem w aplikacji
                  • Możliwością rezygnacji przed zmianami
                </p>
                
                <h3 className="text-lg font-semibold mb-3 mt-6">Kontakt</h3>
                <p className="text-sm">
                  Pytania dotyczące regulaminu:
                  • Email: legal@dopaforge.com
                  • Adres: DopaForge sp. z o.o., ul. Przykładowa 123, 00-001 Warszawa
                </p>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">
                    Dziękujemy za zaufanie i korzystanie z DopaForge! 
                    Razem pokonamy prokrastynację! 💪
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}