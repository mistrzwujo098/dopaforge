# Instrukcja Testowania DopaForge 🧪

## Spis treści
1. [Przygotowanie środowiska](#przygotowanie-środowiska)
2. [Scenariusze testowe](#scenariusze-testowe)
3. [Lista kontrolna funkcjonalności](#lista-kontrolna-funkcjonalności)
4. [Testy psychologicznych interwencji](#testy-psychologicznych-interwencji)
5. [Testy mobilne i PWA](#testy-mobilne-i-pwa)
6. [Raportowanie błędów](#raportowanie-błędów)

## Przygotowanie środowiska

### 1. Uruchomienie lokalnie
```bash
# Sklonuj repozytorium
git clone https://github.com/mistrzwujo098/dopaforge.git
cd dopaforge

# Zainstaluj zależności (wymagany Node.js 18+)
npm install -g pnpm
pnpm install

# Skopiuj zmienne środowiskowe
cp apps/web/.env.local.example apps/web/.env.local
# Edytuj plik i dodaj prawdziwe klucze Supabase

# Uruchom aplikację
pnpm dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:3000

### 2. Testowe konta
Utwórz kilka kont testowych z różnymi emailami:
- tester1@example.com
- tester2@example.com
- mobile.tester@example.com

## Scenariusze testowe

### 🔐 Test 1: Rejestracja i logowanie

1. **Rejestracja nowego użytkownika**
   - [ ] Wejdź na stronę główną
   - [ ] Kliknij "Get Started" 
   - [ ] Wprowadź email testowy
   - [ ] Sprawdź czy otrzymałeś email z magic link
   - [ ] Kliknij link w emailu
   - [ ] Sprawdź czy zostałeś zalogowany i przekierowany do dashboardu

2. **Wylogowanie i ponowne logowanie**
   - [ ] Kliknij przycisk wylogowania
   - [ ] Spróbuj zalogować się ponownie tym samym emailem
   - [ ] Sprawdź czy magic link działa poprawnie

### 📝 Test 2: Zarządzanie zadaniami

1. **Tworzenie zadania**
   - [ ] Kliknij "New Micro Task"
   - [ ] Wprowadź tytuł: "Napisać raport"
   - [ ] Ustaw czas: 30 minut (przesuń suwak)
   - [ ] Kliknij "Create Task"
   - [ ] Sprawdź czy zadanie pojawiło się na liście

2. **Przeciąganie zadań (drag & drop)**
   - [ ] Stwórz 3-4 zadania
   - [ ] Złap zadanie za ikonę (6 kropek) i przeciągnij w inne miejsce
   - [ ] Sprawdź czy kolejność się zachowuje po odświeżeniu strony

3. **Rozpoczęcie zadania**
   - [ ] Kliknij przycisk play przy zadaniu
   - [ ] Sprawdź czy zostałeś przeniesiony do ekranu timera
   - [ ] Sprawdź czy timer odlicza czas

### ⏱️ Test 3: Timer i fokus

1. **Podstawowe funkcje timera**
   - [ ] Start timera - czy czas się odlicza
   - [ ] Pauza - czy timer się zatrzymuje
   - [ ] Resume - czy timer wznawia odliczanie
   - [ ] Reset - czy timer wraca do początkowego czasu

2. **Skróty klawiszowe**
   - [ ] Spacja - start/pauza
   - [ ] Esc - powrót do dashboardu

3. **Zeigarnik Smart-Resume**
   - [ ] Rozpocznij timer
   - [ ] Przełącz się na inną kartę na >30 sekund
   - [ ] Wróć - sprawdź czy pojawiło się powiadomienie o pauzie
   - [ ] Sprawdź czy zadanie zostało zapisane jako "open loop"

4. **Ukończenie zadania**
   - [ ] Pozwól timerowi dobiec do końca
   - [ ] Sprawdź czy pojawiły się konfetti
   - [ ] Sprawdź czy zadanie jest oznaczone jako ukończone
   - [ ] Sprawdź czy otrzymałeś XP

### 🎮 Test 4: Gamifikacja

1. **System XP i poziomów**
   - [ ] Ukończ kilka zadań
   - [ ] Sprawdź czy XP się sumuje w statystykach
   - [ ] Sprawdź całkowite XP w profilu

2. **Odznaki (badges)**
   - [ ] Ukończ pierwsze zadanie - sprawdź odznakę "Starter"
   - [ ] Zdobądź 500 XP - sprawdź odznakę "Momentum"
   - [ ] Sprawdź listę wszystkich odznak

3. **Lootbox**
   - [ ] Kliknij na Lootbox w prawym panelu
   - [ ] Kliknij "Spin" - sprawdź animację
   - [ ] Sprawdź otrzymaną nagrodę
   - [ ] Spróbuj kliknąć ponownie - powinien być 24h cooldown

### 🧠 Test 5: Funkcje psychologiczne

1. **Future-Self Visualization (rano)**
   - [ ] Zaloguj się rano (lub zmień czas systemowy)
   - [ ] Sprawdź czy pojawił się modal z wizualizacją
   - [ ] Wypełnij formularz i zapisz
   - [ ] Sprawdź czy nie pojawia się ponownie tego samego dnia

2. **Implementation Intentions**
   - [ ] Otwórz panel "If-Then Scripts"
   - [ ] Dodaj nową intencję np. "Gdy skończę kawę, zacznę najtrudniejsze zadanie"
   - [ ] Sprawdź czy można ją aktywować/deaktywować
   - [ ] Sprawdź czy można usunąć

3. **Commitment Contracts**
   - [ ] Otwórz panel "Commitment Contracts"
   - [ ] Stwórz kontrakt z typem "Social accountability"
   - [ ] Ustaw deadline i partnera
   - [ ] Sprawdź status kontraktu

4. **Environmental Priming**
   - [ ] Dodaj "time-based" cue na konkretną godzinę
   - [ ] Dodaj "event-based" cue
   - [ ] Sprawdź czy można je aktywować/deaktywować

5. **Weekly Check-In (niedziela)**
   - [ ] Zaloguj się w niedzielę (lub zmień datę systemową)
   - [ ] Wypełnij ankietę satysfakcji/wypalenia
   - [ ] Sprawdź czy zapisuje się poprawnie

6. **Self-Compassion Meditation**
   - [ ] Oznacz commitment contract jako "failed"
   - [ ] Sprawdź czy pojawił się modal z medytacją
   - [ ] Przejdź przez 2-minutową sesję

### 🔔 Test 6: Powiadomienia i Cue Scheduler

1. **Uprawnienia powiadomień**
   - [ ] Po 10 sekundach powinien pojawić się prompt
   - [ ] Zaakceptuj powiadomienia
   - [ ] Sprawdź czy pojawiło się testowe powiadomienie

2. **Scheduled Cues**
   - [ ] Dodaj przypomnienie codzienne
   - [ ] Dodaj przypomnienie tygodniowe (wybierz dni)
   - [ ] Dodaj przypomnienie na konkretną datę
   - [ ] Sprawdź czy można je włączać/wyłączać

### 🌙 Test 7: Ustawienia i personalizacja

1. **Dark mode**
   - [ ] Przejdź do Settings
   - [ ] Przełącz dark mode
   - [ ] Sprawdź czy cała aplikacja zmienia motyw
   - [ ] Odśwież stronę - czy ustawienie się zachowuje

2. **Break reminders**
   - [ ] Włącz/wyłącz przypomnienia o przerwach
   - [ ] Pracuj przez 90 minut - sprawdź czy pojawia się przypomnienie

### 📱 Test 8: Funkcje mobilne i PWA

1. **Responsywność**
   - [ ] Otwórz aplikację na telefonie
   - [ ] Sprawdź czy wszystkie elementy są czytelne
   - [ ] Sprawdź czy można przewijać wszystkie sekcje
   - [ ] Sprawdź czy modalne okna działają poprawnie

2. **Instalacja PWA**
   - [ ] Na telefonie kliknij "Dodaj do ekranu głównego"
   - [ ] Sprawdź czy aplikacja otwiera się w trybie fullscreen
   - [ ] Sprawdź czy działa offline (wyłącz internet)

3. **Offline mode**
   - [ ] Stwórz zadanie będąc online
   - [ ] Wyłącz internet
   - [ ] Spróbuj stworzyć kolejne zadanie
   - [ ] Włącz internet - sprawdź czy zadania się zsynchronizowały

### 🔄 Test 9: Synchronizacja real-time

1. **Synchronizacja między kartami**
   - [ ] Otwórz aplikację w 2 kartach przeglądarki
   - [ ] Stwórz zadanie w jednej karcie
   - [ ] Sprawdź czy pojawiło się w drugiej
   - [ ] Ukończ zadanie - sprawdź synchronizację

2. **Synchronizacja między urządzeniami**
   - [ ] Zaloguj się na komputerze i telefonie
   - [ ] Wykonaj akcje na jednym urządzeniu
   - [ ] Sprawdź czy zmiany są widoczne na drugim

### ♿ Test 10: Dostępność

1. **Nawigacja klawiaturą**
   - [ ] Spróbuj nawigować używając tylko Tab
   - [ ] Sprawdź czy wszystkie przyciski są dostępne
   - [ ] Sprawdź czy focus jest wyraźnie widoczny

2. **Screen reader**
   - [ ] Włącz screen reader (NVDA/JAWS na Windows, VoiceOver na Mac)
   - [ ] Sprawdź czy wszystkie elementy mają opisy
   - [ ] Sprawdź link "Skip to main content"

## Lista kontrolna funkcjonalności

### Podstawowe funkcje ✅
- [ ] Rejestracja/logowanie (magic link)
- [ ] Tworzenie zadań (5-90 minut)
- [ ] Drag & drop zadań
- [ ] Timer z pauzą i resetem
- [ ] Ukończanie zadań
- [ ] System XP i poziomów
- [ ] Odznaki
- [ ] Dark mode
- [ ] Ustawienia profilu

### Funkcje psychologiczne 🧠
- [ ] Future-Self Visualization (poranna)
- [ ] Implementation Intentions (If-Then)
- [ ] Zeigarnik Smart-Resume
- [ ] Commitment Contracts
- [ ] Environmental Priming
- [ ] Self-Compassion Meditation
- [ ] Weekly Check-In (niedzielna)
- [ ] Lootbox (24h cooldown)
- [ ] Cue Scheduler

### Funkcje techniczne 🔧
- [ ] PWA - instalacja na telefonie
- [ ] Offline mode
- [ ] Real-time sync
- [ ] Powiadomienia push
- [ ] Responsywność mobilna
- [ ] Skróty klawiszowe
- [ ] Dostępność (ARIA, fokus)

## Testy psychologicznych interwencji

### Sprawdzenie skuteczności mechanizmów:

1. **Micro-habits test**
   - Czy łatwo jest rozbić duże zadanie na małe?
   - Czy 5-15 minutowe zadania są mniej przytłaczające?

2. **Dopamine loop test**
   - Czy natychmiastowe nagrody (XP, dźwięki) są satysfakcjonujące?
   - Czy lootbox buduje anticipację?

3. **Commitment device test**
   - Czy commitment contracts zwiększają motywację?
   - Czy strach przed "karą" mobilizuje?

4. **Environmental design test**
   - Czy priming cues przypominają o zadaniach?
   - Czy implementation intentions pomagają rozpocząć?

## Testy mobilne i PWA

### Android:
1. Chrome - instalacja PWA
2. Powiadomienia
3. Offline mode
4. Orientacja ekranu

### iOS:
1. Safari - dodanie do ekranu głównego
2. Ograniczenia powiadomień
3. PWA w trybie standalone
4. Gesty nawigacji

## Raportowanie błędów

### Szablon raportu:
```markdown
**Opis błędu:**
[Co się stało?]

**Kroki do reprodukcji:**
1. [Krok 1]
2. [Krok 2]
3. [...]

**Oczekiwane zachowanie:**
[Co powinno się stać?]

**Rzeczywiste zachowanie:**
[Co się faktycznie stało?]

**Środowisko:**
- Przeglądarka: [Chrome/Firefox/Safari]
- System: [Windows/Mac/Android/iOS]
- Wersja: [np. Chrome 120]
- Urządzenie: [Desktop/Mobile]

**Zrzuty ekranu:**
[Jeśli możliwe, dodaj screenshoty]

**Konsola błędów:**
[Skopiuj błędy z konsoli przeglądarki]
```

### Gdzie zgłaszać błędy:
- GitHub Issues: https://github.com/mistrzwujo098/dopaforge/issues
- Oznacz jako `bug` i dodaj odpowiednie labele

## Wskazówki dla testerów

1. **Testuj jak prawdziwy użytkownik** - nie tylko "happy path"
2. **Próbuj złamać aplikację** - wpisuj dziwne dane, klikaj szybko
3. **Testuj na różnych urządzeniach** - telefon, tablet, desktop
4. **Sprawdzaj konsystencję** - czy aplikacja zachowuje się tak samo
5. **Zwracaj uwagę na UX** - czy jest intuicyjnie?
6. **Testuj edge cases** - co się stanie przy 100 zadaniach?
7. **Sprawdzaj performance** - czy aplikacja nie zwalnia?

## Kontakt

W razie pytań dotyczących testowania:
- Utwórz issue na GitHub z tagiem `question`
- Opisz dokładnie problem lub niejasność

Dziękujemy za pomoc w testowaniu DopaForge! 🚀