# Konfiguracja funkcji AI w DopaForge

## Wymagania

Aby korzystać z funkcji AI w aplikacji DopaForge, potrzebujesz klucza API Google Gemini.

## Kroki konfiguracji

1. **Uzyskaj klucz API Gemini**
   - Przejdź do: https://makersuite.google.com/app/apikey
   - Zaloguj się kontem Google
   - Kliknij "Create API Key"
   - Skopiuj wygenerowany klucz

2. **Dodaj klucz do pliku .env.local**
   ```bash
   # W katalogu apps/web utwórz lub edytuj plik .env.local
   GEMINI_API_KEY=twój_klucz_api_tutaj
   ```

3. **Zrestartuj serwer deweloperski**
   ```bash
   pnpm dev
   ```

## Funkcje AI w aplikacji

Po skonfigurowaniu klucza API będziesz mógł korzystać z:

### 1. **Progress Story** (Generowanie historii postępów)
- Lokalizacja: Dashboard główny
- Generuje motywujące podsumowanie Twoich osiągnięć

### 2. **Task Priority Advisor** (Doradca priorytetów)
- Lokalizacja: Prawa strona dashboardu
- Sugeruje które zadanie wykonać najpierw na podstawie Twojej energii

### 3. **Emotion Interventions** (Interwencje emocjonalne)
- Lokalizacja: Automatyczne powiadomienia
- Proponuje przerwy i wsparcie gdy pracujesz zbyt długo

### 4. **Task Breakdown** (Podział zadań)
- Lokalizacja: Przy tworzeniu zadań
- Pomaga podzielić duże zadania na mniejsze kroki

## Działanie bez klucza API

Aplikacja działa również bez klucza API, ale funkcje AI będą ograniczone:
- Progress Story pokaże prosty komunikat zamiast spersonalizowanej historii
- Task Priority Advisor pokaże komunikat o braku klucza
- Emotion Interventions użyje predefiniowanych wiadomości
- Task Breakdown nie będzie dostępny

## Rozwiązywanie problemów

### Błąd "Missing GEMINI_API_KEY"
- Upewnij się, że plik `.env.local` znajduje się w katalogu `apps/web`
- Sprawdź czy klucz jest poprawnie skopiowany (bez spacji)
- Zrestartuj serwer deweloperski po dodaniu klucza

### Błąd 429 "Too many requests"
- Aplikacja ma wbudowany rate limiting
- Poczekaj chwilę przed kolejną próbą
- Limit to 20 zapytań na minutę per użytkownik

### Inne błędy
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź logi serwera w terminalu
- Upewnij się, że masz aktywne połączenie internetowe

## Bezpieczeństwo

- **NIGDY** nie commituj pliku `.env.local` do repozytorium
- Klucz API jest używany tylko po stronie serwera
- Klient nie ma bezpośredniego dostępu do klucza