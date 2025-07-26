# Instrukcja uruchamiania testów w Dockerze

## Szybki start

### 1. Upewnij się, że Docker jest uruchomiony
```bash
docker --version
docker ps
```

### 2. Nadaj uprawnienia skryptowi testowemu
```bash
chmod +x ./scripts/test-docker.sh
```

### 3. Uruchom wszystkie testy
```bash
./scripts/test-docker.sh all
```

## Rodzaje testów

### Testy jednostkowe (Unit Tests)
```bash
./scripts/test-docker.sh unit
```
Testują pojedyncze komponenty w izolacji.

### Testy integracyjne (Integration Tests)
```bash
./scripts/test-docker.sh integration
```
Testują współpracę między komponentami i bazą danych.

### Testy E2E (End-to-End)
```bash
./scripts/test-docker.sh e2e
```
Testują pełne scenariusze użytkownika w przeglądarce.

### Wszystkie testy
```bash
./scripts/test-docker.sh all
```

## Co się dzieje podczas testów?

1. **Budowanie obrazów Docker** - tworzony jest kontener testowy z aplikacją
2. **Uruchamianie bazy danych** - PostgreSQL z rozszerzeniami Supabase
3. **Uruchamianie Redis** - cache dla testów
4. **Migracje bazy danych** - tworzenie struktury tabel
5. **Uruchomienie testów** - wykonanie wybranych testów
6. **Czyszczenie** - usunięcie kontenerów i danych testowych

## Podgląd wyników

### Podczas testów
Możesz oglądać logi w czasie rzeczywistym:
```bash
docker-compose -f docker-compose.test.yml logs -f
```

### Dostęp do bazy testowej
```bash
docker exec -it dopaforge-test-db psql -U postgres -d dopaforge_test
```

### Supabase Studio (GUI dla bazy)
Gdy testy są uruchomione, otwórz w przeglądarce:
```
http://localhost:54323
```

## Rozwiązywanie problemów

### Porty są zajęte
Jeśli widzisz błąd o zajętych portach:
```bash
# Zatrzymaj wszystkie kontenery testowe
docker-compose -f docker-compose.test.yml down

# Sprawdź, co używa portów
lsof -i :54322  # Test DB
lsof -i :54323  # Test Studio
lsof -i :6380   # Test Redis
```

### Testy nie przechodzą
1. Sprawdź logi: `docker-compose -f docker-compose.test.yml logs`
2. Wyczyść środowisko: `docker-compose -f docker-compose.test.yml down -v`
3. Przebuduj obrazy: `docker-compose -f docker-compose.test.yml build --no-cache`

### Brak uprawnień
```bash
chmod +x ./scripts/test-docker.sh
```

## Struktura testów

```
DopaForge/
├── docker-compose.test.yml    # Konfiguracja Docker dla testów
├── Dockerfile.test           # Obraz Docker dla testów
├── scripts/test-docker.sh    # Skrypt uruchamiający
└── apps/web/
    ├── src/
    │   └── app/api/__tests__/  # Testy integracyjne
    └── cypress/e2e/            # Testy E2E
```

## Zmienne środowiskowe

Testy używają następujących zmiennych:
- `DATABASE_URL`: postgresql://postgres:test123@test-db:5432/dopaforge_test
- `NEXT_PUBLIC_SUPABASE_URL`: http://localhost:54321
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: test-anon-key
- `REDIS_URL`: redis://test-redis:6379

## Uruchamianie pojedynczego testu

Jeśli chcesz uruchomić konkretny plik testowy:
```bash
# Wejdź do kontenera
docker-compose -f docker-compose.test.yml run --rm test-runner sh

# Uruchom konkretny test
pnpm vitest run src/app/api/__tests__/auth.test.ts
```

## Podsumowanie

Testy w Dockerze zapewniają:
- ✅ Identyczne środowisko dla wszystkich
- ✅ Izolację od lokalnej konfiguracji
- ✅ Łatwe czyszczenie po testach
- ✅ Możliwość testowania na różnych systemach

Pytania? Sprawdź pełną dokumentację w `docs/TESTING.md`