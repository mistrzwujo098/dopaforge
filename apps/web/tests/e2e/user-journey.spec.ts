import { test, expect } from '@playwright/test';

// Konfiguracja bazowego URL
const BASE_URL = 'http://localhost:3000';

// Dane testowe
const TEST_USER = {
  email: 'test@dopaforge.com',
  password: 'TestPassword123!',
  name: 'Test User'
};

const TEST_TASK = {
  title: 'Napisać raport z testów',
  duration: 15
};

test.describe('DopaForge - Pełna ścieżka użytkownika', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('1. Landing page - weryfikacja treści i nawigacji', async ({ page }) => {
    // Sprawdź tytuł strony
    await expect(page).toHaveTitle(/DopaForge/);
    
    // Sprawdź główny nagłówek
    await expect(page.locator('h1')).toContainText('Twój mózg pokocha');
    
    // Sprawdź przyciski CTA
    const startButton = page.getByRole('button', { name: /Zacznij teraz/i });
    await expect(startButton).toBeVisible();
    
    // Sprawdź sekcję "Jak to działa"
    await page.getByRole('button', { name: /Zobacz jak to działa/i }).click();
    await expect(page.locator('#how-it-works')).toBeInViewport();
    
    // Sprawdź statystyki
    await expect(page.getByText('94%')).toBeVisible();
    await expect(page.getByText('skuteczności')).toBeVisible();
    
    // Zrób screenshot
    await page.screenshot({ path: 'test-results/landing-page.png', fullPage: true });
  });

  test('2. Rejestracja nowego użytkownika', async ({ page }) => {
    // Przejdź do strony rejestracji
    await page.getByRole('button', { name: /Rozpocznij za darmo/i }).click();
    await expect(page).toHaveURL(/\/auth/);
    
    // Wypełnij formularz rejestracji
    await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
    await page.getByPlaceholder(/hasło/i).fill(TEST_USER.password);
    
    // Zaznacz zgody
    const termsCheckbox = page.getByRole('checkbox');
    await termsCheckbox.check();
    
    // Kliknij przycisk rejestracji
    await page.getByRole('button', { name: /Zarejestruj się/i }).click();
    
    // Sprawdź czy pojawia się komunikat o weryfikacji emaila
    await expect(page.getByText(/sprawdź swoją skrzynkę/i)).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'test-results/registration.png' });
  });

  test('3. Logowanie i onboarding', async ({ page }) => {
    // Przejdź do logowania
    await page.goto(`${BASE_URL}/auth`);
    
    // Zaloguj się
    await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
    await page.getByPlaceholder(/hasło/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /Zaloguj się/i }).click();
    
    // Sprawdź czy przekierowało do onboardingu
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    
    // Przejdź przez onboarding
    const steps = [
      { button: /Dalej/i, text: /Witaj w DopaForge/i },
      { button: /Dalej/i, text: /Mikro-zadania/i },
      { button: /Dalej/i, text: /System nagród/i },
      { button: /Rozpocznij/i, text: /Gotowy/i }
    ];
    
    for (const step of steps) {
      await expect(page.getByText(step.text)).toBeVisible();
      await page.getByRole('button', { name: step.button }).click();
    }
    
    // Sprawdź czy jesteśmy na dashboardzie
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('4. Dashboard - tworzenie i zarządzanie zadaniami', async ({ page }) => {
    // Symuluj zalogowanego użytkownika
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Sprawdź elementy dashboardu
    await expect(page.getByText(/Czas na dopaminę/i)).toBeVisible();
    
    // Otwórz dialog tworzenia zadania
    await page.getByRole('button', { name: /dodaj zadanie/i }).click();
    
    // Wypełnij formularz zadania
    await page.getByPlaceholder(/Co chcesz zrobić/i).fill(TEST_TASK.title);
    await page.getByRole('button', { name: new RegExp(`${TEST_TASK.duration} min`) }).click();
    
    // Utwórz zadanie
    await page.getByRole('button', { name: /Utwórz/i }).click();
    
    // Sprawdź czy zadanie się pojawiło
    await expect(page.getByText(TEST_TASK.title)).toBeVisible();
    
    // Rozpocznij zadanie
    await page.getByRole('button', { name: /START/i }).click();
    
    // Sprawdź czy przekierowało do strony fokusa
    await expect(page).toHaveURL(/\/focus\//);
    
    await page.screenshot({ path: 'test-results/dashboard-with-task.png' });
  });

  test('5. Fokus - wykonywanie zadania', async ({ page }) => {
    // Przejdź bezpośrednio do strony fokusa (z przykładowym ID)
    await page.goto(`${BASE_URL}/focus/test-task-id`);
    
    // Sprawdź elementy strony fokusa
    await expect(page.getByText(/Skupienie/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Ukończ zadanie/i })).toBeVisible();
    
    // Symuluj ukończenie zadania
    await page.getByRole('button', { name: /Ukończ zadanie/i }).click();
    
    // Sprawdź czy pojawiło się podsumowanie
    await expect(page.getByText(/Gratulacje/i)).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/task-completion.png' });
  });

  test('6. Nawigacja - sidebar i odkrywanie funkcji', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Sprawdź sidebar na desktopie
    if (await page.viewportSize()?.width! >= 768) {
      await expect(page.getByRole('navigation')).toBeVisible();
      
      // Sprawdź pozycje menu
      const menuItems = ['Zadania', 'Statystyki', 'Ustawienia'];
      for (const item of menuItems) {
        await expect(page.getByRole('button', { name: item })).toBeVisible();
      }
      
      // Sprawdź zablokowane funkcje
      const lockedFeatures = page.locator('[data-locked="true"]');
      const lockedCount = await lockedFeatures.count();
      expect(lockedCount).toBeGreaterThan(0);
    }
    
    // Test na urządzeniu mobilnym
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Otwórz menu mobilne
    await page.getByRole('button', { name: /menu/i }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    
    await page.screenshot({ path: 'test-results/mobile-navigation.png' });
  });

  test('7. Statystyki - sprawdzanie postępów', async ({ page }) => {
    await page.goto(`${BASE_URL}/stats`);
    
    // Sprawdź główne metryki
    await expect(page.getByText(/Całkowite XP/i)).toBeVisible();
    await expect(page.getByText(/Ukończone zadania/i)).toBeVisible();
    await expect(page.getByText(/Czas skupienia/i)).toBeVisible();
    await expect(page.getByText(/Seria dni/i)).toBeVisible();
    
    // Sprawdź wykresy
    await expect(page.getByText(/Aktywność w tym tygodniu/i)).toBeVisible();
    await expect(page.getByText(/Najlepsze godziny pracy/i)).toBeVisible();
    
    await page.screenshot({ path: 'test-results/statistics.png' });
  });

  test('8. Ustawienia - personalizacja', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    
    // Sprawdź sekcje ustawień
    const sections = ['Wygląd', 'Powiadomienia', 'Produktywność', 'Konto'];
    for (const section of sections) {
      await expect(page.getByText(section)).toBeVisible();
    }
    
    // Przełącz tryb ciemny
    const darkModeSwitch = page.getByRole('switch', { name: /Tryb ciemny/i });
    await darkModeSwitch.click();
    
    // Sprawdź czy tryb ciemny się włączył
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Przełącz z powrotem
    await darkModeSwitch.click();
    
    // Zmień inne ustawienia
    await page.getByRole('switch', { name: /Efekty dźwiękowe/i }).click();
    await page.getByRole('switch', { name: /Cytaty motywacyjne/i }).click();
    
    await page.screenshot({ path: 'test-results/settings.png' });
  });

  test('9. Responsywność - test na różnych urządzeniach', async ({ page }) => {
    const devices = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const device of devices) {
      await page.setViewportSize({ width: device.width, height: device.height });
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Sprawdź czy strona się poprawnie wyświetla
      await expect(page.getByText(/Czas na dopaminę/i)).toBeVisible();
      
      await page.screenshot({ 
        path: `test-results/responsive-${device.name.toLowerCase()}.png`,
        fullPage: true 
      });
    }
  });

  test('10. Błędy i edge cases', async ({ page }) => {
    // Test pustego formularza
    await page.goto(`${BASE_URL}/dashboard`);
    await page.getByRole('button', { name: /dodaj zadanie/i }).click();
    await page.getByRole('button', { name: /Utwórz/i }).click();
    
    // Sprawdź walidację
    await expect(page.getByText(/Wpisz nazwę zadania/i)).toBeVisible();
    
    // Test bardzo długiej nazwy zadania
    const longTitle = 'a'.repeat(200);
    await page.getByPlaceholder(/Co chcesz zrobić/i).fill(longTitle);
    await page.getByRole('button', { name: /Utwórz/i }).click();
    
    // Test offline mode
    await page.context().setOffline(true);
    await page.reload();
    await expect(page.getByText(/Brak połączenia/i)).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'test-results/error-states.png' });
  });
});

// Test wydajności
test.describe('Testy wydajności', () => {
  test('Czas ładowania strony głównej', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Maksymalnie 3 sekundy
    
    // Sprawdź metryki Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcp = entries.find(e => e.name === 'first-contentful-paint');
          const lcp = entries.find(e => e.entryType === 'largest-contentful-paint');
          resolve({
            FCP: fcp?.startTime,
            LCP: lcp?.startTime
          });
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      });
    });
    
    console.log('Performance metrics:', metrics);
  });
});

// Generowanie raportu
test.afterAll(async () => {
  console.log('Testy zakończone. Sprawdź folder test-results/ dla screenshotów.');
});