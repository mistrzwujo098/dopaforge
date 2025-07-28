import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

interface TestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
  systemInfo: {
    platform: string;
    nodeVersion: string;
    playwrightVersion: string;
  };
}

class AutomatedTester {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];
  private startTime: number = 0;

  async setup() {
    this.browser = await chromium.launch({ 
      headless: false, // Ustaw na true dla trybu headless
      slowMo: 100 // Spowolnij dla lepszej widoczności
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'pl-PL',
      timezoneId: 'Europe/Warsaw'
    });
    this.page = await this.context.newPage();
    this.startTime = Date.now();
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const testStart = Date.now();
    const result: TestResult = {
      name,
      status: 'passed',
      duration: 0
    };

    try {
      console.log(`🔄 Wykonuję test: ${name}`);
      await testFn();
      console.log(`✅ Test zakończony: ${name}`);
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
      console.log(`❌ Test nieudany: ${name} - ${result.error}`);
      
      // Zrób screenshot przy błędzie
      if (this.page) {
        const screenshotPath = `test-results/error-${name.replace(/\s+/g, '-')}.png`;
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        result.screenshot = screenshotPath;
      }
    }

    result.duration = Date.now() - testStart;
    this.results.push(result);
    return result;
  }

  async runAllTests() {
    await this.setup();

    // Test 1: Landing page
    await this.runTest('Landing page - podstawowa nawigacja', async () => {
      await this.page!.goto('http://localhost:3000');
      await this.page!.waitForSelector('h1:has-text("Twój mózg pokocha")');
      
      const startButton = await this.page!.$('button:has-text("Zacznij teraz")');
      if (!startButton) throw new Error('Brak przycisku "Zacznij teraz"');
      
      const stats = await this.page!.$$eval('.text-4xl', elements => elements.length);
      if (stats < 4) throw new Error('Brak wszystkich statystyk na stronie');
    });

    // Test 2: Responsywność
    await this.runTest('Responsywność - widok mobilny', async () => {
      await this.page!.setViewportSize({ width: 375, height: 667 });
      await this.page!.goto('http://localhost:3000');
      await this.page!.waitForTimeout(1000);
      
      // Sprawdź czy jest menu mobilne
      const menuButton = await this.page!.$('button[aria-label="Menu"]');
      if (!menuButton) throw new Error('Brak przycisku menu mobilnego');
      
      // Kliknij menu
      await menuButton.click();
      await this.page!.waitForTimeout(500);
      
      // Sprawdź czy menu się otworzyło - sprawdź czy jest widoczny tekst "Menu"
      const menuHeader = await this.page!.$('text=/Menu/');
      if (!menuHeader) throw new Error('Menu mobilne nie otworzyło się');
      
      // Sprawdź czy jest przycisk zamykania (X)
      const closeButton = await this.page!.$('button[aria-label="Zamknij menu"]');
      if (!closeButton) throw new Error('Brak przycisku zamykania menu');
    });

    // Test 3: Nawigacja do auth
    await this.runTest('Nawigacja do strony logowania', async () => {
      await this.page!.setViewportSize({ width: 1280, height: 720 });
      await this.page!.goto('http://localhost:3000');
      await this.page!.click('button:has-text("Rozpocznij za darmo")');
      await this.page!.waitForURL('**/auth');
      
      const emailInput = await this.page!.$('input[type="email"]');
      if (!emailInput) throw new Error('Brak pola email na stronie logowania');
    });

    // Test 4: Walidacja formularza
    await this.runTest('Walidacja formularza logowania', async () => {
      await this.page!.goto('http://localhost:3000/auth');
      
      // Poczekaj na załadowanie formularza
      await this.page!.waitForSelector('form', { timeout: 5000 });
      
      // Wypełnij formularz nieprawidłowymi danymi
      await this.page!.fill('input[type="email"]', 'invalid-email');
      await this.page!.fill('input[type="password"]', '123'); // Za krótkie hasło
      
      // Znajdź przycisk submit w formularzu
      const submitButton = await this.page!.$('button[type="submit"]');
      if (!submitButton) throw new Error('Brak przycisku submit w formularzu');
      
      await submitButton.click();
      
      // Sprawdź czy pojawiają się błędy walidacji lub czy formularz się nie wysłał
      await this.page!.waitForTimeout(2000);
      const currentUrl = this.page!.url();
      if (!currentUrl.includes('/auth')) throw new Error('Formularz się wysłał mimo błędnych danych');
    });

    // Test 5: Dashboard (symulacja)
    await this.runTest('Dashboard - sprawdzenie struktury', async () => {
      await this.page!.goto('http://localhost:3000/dashboard');
      
      // Sprawdź czy przekierowuje do auth (jeśli niezalogowany)
      const currentUrl = this.page!.url();
      if (currentUrl.includes('/dashboard')) {
        // Jeśli jesteśmy na dashboardzie, sprawdź strukturę
        await this.page!.waitForSelector('h1:has-text("Czas na dopaminę")', { timeout: 5000 }).catch(() => {
          throw new Error('Brak nagłówka dashboardu');
        });
      }
    });

    // Test 6: Statystyki
    await this.runTest('Strona statystyk - ładowanie', async () => {
      await this.page!.goto('http://localhost:3000/stats');
      
      // Poczekaj chwilę na załadowanie
      await this.page!.waitForTimeout(1000);
      
      // Sprawdź czy strona się załadowała (czy jest sidebar lub spinner lub komunikat)
      const sidebar = await this.page!.$('aside');
      const spinner = await this.page!.$('[class*="animate-spin"]');
      const noDataMessage = await this.page!.$('p:has-text("Brak danych")');
      
      if (!sidebar && !spinner && !noDataMessage) {
        throw new Error('Strona statystyk nie załadowała się poprawnie');
      }
      
      // Jeśli cokolwiek z powyższych jest widoczne, test przechodzi
    });

    // Test 7: Ustawienia
    await this.runTest('Strona ustawień - struktura', async () => {
      await this.page!.goto('http://localhost:3000/settings');
      
      const currentUrl = this.page!.url();
      if (currentUrl.includes('/settings')) {
        await this.page!.waitForSelector('h1:has-text("Ustawienia")', { timeout: 5000 }).catch(() => {
          throw new Error('Brak nagłówka ustawień');
        });
      }
    });

    // Test 8: Scroll i animacje
    await this.runTest('Smooth scroll i animacje', async () => {
      await this.page!.goto('http://localhost:3000');
      await this.page!.click('button:has-text("Zobacz jak to działa")');
      await this.page!.waitForTimeout(1000);
      
      const howItWorksSection = await this.page!.$('#how-it-works');
      if (!howItWorksSection) throw new Error('Brak sekcji "Jak to działa"');
      
      const isVisible = await howItWorksSection.isVisible();
      if (!isVisible) throw new Error('Sekcja nie jest widoczna po kliknięciu');
    });

    // Test 9: Dark mode (jeśli dostępny)
    await this.runTest('Tryb ciemny - przełączanie', async () => {
      await this.page!.goto('http://localhost:3000/settings');
      
      const currentUrl = this.page!.url();
      if (currentUrl.includes('/settings')) {
        const darkModeSwitch = await this.page!.$('button[role="switch"]');
        if (darkModeSwitch) {
          await darkModeSwitch.click();
          await this.page!.waitForTimeout(500);
          
          const htmlClass = await this.page!.$eval('html', el => el.className);
          if (!htmlClass.includes('dark')) throw new Error('Tryb ciemny nie został włączony');
        }
      }
    });

    // Test 10: Performance
    await this.runTest('Wydajność - czas ładowania', async () => {
      const startTime = Date.now();
      await this.page!.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      if (loadTime > 5000) throw new Error(`Zbyt długi czas ładowania: ${loadTime}ms`);
      
      // Sprawdź FCP (First Contentful Paint)
      const metrics = await this.page!.evaluate(() => {
        return performance.getEntriesByType('paint');
      });
      
      console.log('Metryki wydajności:', metrics);
    });

    await this.teardown();
    return this.generateReport();
  }

  private generateReport(): TestReport {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length,
      passed,
      failed,
      skipped,
      duration,
      results: this.results,
      systemInfo: {
        platform: process.platform,
        nodeVersion: process.version,
        playwrightVersion: require('@playwright/test/package.json').version
      }
    };
  }

  async saveReport(report: TestReport) {
    const reportPath = path.join('test-results', 'automated-test-report.json');
    await fs.mkdir('test-results', { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Generuj też raport HTML
    const htmlReport = this.generateHTMLReport(report);
    await fs.writeFile(
      path.join('test-results', 'automated-test-report.html'), 
      htmlReport
    );
  }

  private generateHTMLReport(report: TestReport): string {
    return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DopaForge - Raport z testów automatycznych</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat { padding: 20px; border-radius: 8px; text-align: center; }
    .stat.passed { background: #d4edda; color: #155724; }
    .stat.failed { background: #f8d7da; color: #721c24; }
    .stat.total { background: #d1ecf1; color: #0c5460; }
    .test-result { margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid; }
    .test-result.passed { border-color: #28a745; background: #f8f9fa; }
    .test-result.failed { border-color: #dc3545; background: #fff5f5; }
    .error { color: #dc3545; margin-top: 10px; font-family: monospace; font-size: 14px; }
    .duration { color: #6c757d; font-size: 14px; }
    .screenshot { margin-top: 10px; }
    .screenshot img { max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🧪 DopaForge - Raport z testów automatycznych</h1>
    <p>Wygenerowano: ${new Date(report.timestamp).toLocaleString('pl-PL')}</p>
    
    <div class="summary">
      <div class="stat total">
        <h2>${report.totalTests}</h2>
        <p>Wszystkie testy</p>
      </div>
      <div class="stat passed">
        <h2>${report.passed}</h2>
        <p>Zaliczone</p>
      </div>
      <div class="stat failed">
        <h2>${report.failed}</h2>
        <p>Nieudane</p>
      </div>
    </div>
    
    <h2>Szczegółowe wyniki:</h2>
    ${report.results.map(result => `
      <div class="test-result ${result.status}">
        <h3>${result.status === 'passed' ? '✅' : '❌'} ${result.name}</h3>
        <p class="duration">Czas wykonania: ${result.duration}ms</p>
        ${result.error ? `<div class="error">Błąd: ${result.error}</div>` : ''}
        ${result.screenshot ? `
          <div class="screenshot">
            <p>Screenshot błędu:</p>
            <img src="${result.screenshot}" alt="Screenshot błędu">
          </div>
        ` : ''}
      </div>
    `).join('')}
    
    <hr>
    <p style="color: #6c757d; font-size: 14px;">
      System: ${report.systemInfo.platform} | Node: ${report.systemInfo.nodeVersion} | Playwright: ${report.systemInfo.playwrightVersion}
    </p>
  </div>
</body>
</html>
    `;
  }
}

// Uruchom testy
async function runTests() {
  console.log('🚀 Rozpoczynam automatyczne testy DopaForge...\n');
  
  const tester = new AutomatedTester();
  try {
    const report = await tester.runAllTests();
    await tester.saveReport(report);
    
    console.log('\n📊 Podsumowanie testów:');
    console.log(`✅ Zaliczone: ${report.passed}`);
    console.log(`❌ Nieudane: ${report.failed}`);
    console.log(`⏭️  Pominięte: ${report.skipped}`);
    console.log(`⏱️  Całkowity czas: ${report.duration}ms`);
    console.log('\n📄 Raport zapisany w: test-results/automated-test-report.html');
    
    process.exit(report.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Krytyczny błąd podczas testów:', error);
    process.exit(1);
  }
}

// Uruchom jeśli wywołane bezpośrednio
if (require.main === module) {
  runTests();
}

export { AutomatedTester, runTests };