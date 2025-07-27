const faqs = [
  {
    question: 'Czym jest DopaForge?',
    answer: 'DopaForge to aplikacja do budowania nawyków wykorzystująca system dopaminowy. Pomagamy pokonać prokrastynację poprzez rozbijanie zadań na mikro-kroki (2-25 minut) i nagradzanie za ich wykonanie.',
  },
  {
    question: 'Jak DopaForge pomaga w prokrastynacji?',
    answer: 'Wykorzystujemy neuronaukę i gamifikację. Każde zadanie to mini-gra, która aktywuje centrum nagrody w mózgu. Dzięki temu produktywność staje się przyjemna, a nie męcząca.',
  },
  {
    question: 'Ile kosztuje DopaForge?',
    answer: 'DopaForge jest całkowicie darmowe. Nie ma ukrytych opłat ani limitów. Wierzymy, że każdy zasługuje na produktywność bez barier finansowych.',
  },
  {
    question: 'Czy DopaForge działa na telefonie?',
    answer: 'Tak! DopaForge to aplikacja webowa PWA, która działa na każdym urządzeniu z przeglądarką - telefonie, tablecie czy komputerze. Możesz nawet zainstalować ją jak natywną aplikację.',
  },
  {
    question: 'Jak szybko zobaczę efekty?',
    answer: 'Większość użytkowników czuje różnicę już pierwszego dnia. 92% tworzy trwały nawyk w ciągu 21 dni regularnego używania aplikacji.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export function FAQSection() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          Najczęściej zadawane pytania
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}