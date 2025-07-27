# Konfiguracja Supabase dla DopaForge

## 1. Konfiguracja Email Authentication

1. Przejdź do https://app.supabase.com
2. Wybierz swój projekt DopaForge
3. W menu bocznym wybierz **Authentication** → **Providers**
4. Upewnij się, że **Email** jest włączony

## 2. Konfiguracja Email Templates

1. W sekcji **Authentication** → **Email Templates**
2. Zaktualizuj template **Confirm signup**:
   - Subject: `Potwierdź swoje konto DopaForge`
   - Body: Możesz użyć domyślnego lub dostosować wiadomość

## 3. Konfiguracja URL dla Vercel

1. W sekcji **Authentication** → **URL Configuration**
2. Ustaw następujące adresy URL:
   - **Site URL**: `https://twoja-nazwa.vercel.app` (lub twoja domena)
   - **Redirect URLs**: Dodaj:
     - `https://twoja-nazwa.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (dla lokalnego development)

## 4. Wyłącz Email Confirmation (Opcjonalnie - dla szybszego testowania)

Jeśli chcesz wyłączyć potwierdzanie emaila podczas testów:

1. **Authentication** → **Providers** → **Email**
2. Wyłącz opcję **Confirm email**

⚠️ **UWAGA**: Zalecam włączyć potwierdzanie emaila na produkcji!

## 5. Konfiguracja RLS (Row Level Security)

Aplikacja wymaga odpowiednich polityk RLS. Sprawdź czy są włączone:

1. **Table Editor** → Wybierz tabelę
2. Kliknij **RLS** → **Enable RLS**
3. Dodaj polityki dla każdej tabeli:

### Przykładowa polityka dla `user_profiles`:

```sql
-- Użytkownicy mogą czytać i aktualizować tylko swój profil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

### Przykładowa polityka dla `micro_tasks`:

```sql
-- Użytkownicy mogą zarządzać tylko swoimi zadaniami
CREATE POLICY "Users can manage own tasks" ON micro_tasks
  FOR ALL USING (auth.uid() = user_id);
```

## 6. Sprawdź Migracje

Upewnij się, że wszystkie migracje zostały wykonane. W SQL Editor wykonaj:

```sql
-- Sprawdź czy tabele istnieją
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Powinieneś zobaczyć tabele:
- user_profiles
- micro_tasks
- achievements
- user_achievements
- daily_rewards
- boss_battles
- skill_trees
- user_skills
- future_self_visualizations
- weekly_reviews
- implementation_intentions
- commitment_contracts
- environmental_priming_cues
- scheduled_cues
- temptation_logs
- behavioral_interventions
- self_compassion_sessions
- social_accountability_posts
- physical_integration_tasks

## 7. Testowanie

1. Przejdź na swoją aplikację
2. Kliknij "Pierwszy raz? Załóż konto"
3. Wprowadź email i hasło (min. 6 znaków)
4. Jeśli email confirmation jest włączone - sprawdź email
5. Po zalogowaniu powinieneś zostać przekierowany do dashboard

## Rozwiązywanie problemów

### "Invalid email or password"
- Sprawdź czy hasło ma min. 6 znaków
- Upewnij się, że email jest poprawny

### "User already registered"
- Ten email już istnieje w systemie
- Użyj opcji logowania zamiast rejestracji

### Dashboard się nie ładuje po zalogowaniu
- Sprawdź w konsoli przeglądarki błędy
- Upewnij się, że zmienne środowiskowe są ustawione na Vercel
- Sprawdź czy RLS polityki są poprawnie skonfigurowane

### Email nie przychodzi
- Sprawdź folder SPAM
- W Supabase Dashboard → Authentication → Logs sprawdź czy email został wysłany
- Możesz tymczasowo wyłączyć email confirmation dla testów