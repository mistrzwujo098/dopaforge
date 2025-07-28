'use client';

import { createSupabaseBrowser } from './supabase-browser';
import type { Database } from '@dopaforge/db';

export interface VerificationResult {
  module: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

/**
 * Weryfikuje czy wszystkie moduły aplikacji poprawnie zapisują dane do bazy
 */
export async function verifyDataSaving(userId: string): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];
  const supabase = createSupabaseBrowser();

  // 1. Weryfikacja profilu użytkownika
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    results.push({
      module: 'user_profiles',
      status: profile ? 'success' : 'warning',
      message: profile ? 'Profil użytkownika istnieje' : 'Brak profilu użytkownika',
      details: profile
    });
  } catch (error) {
    results.push({
      module: 'user_profiles',
      status: 'error',
      message: 'Błąd podczas weryfikacji profilu',
      details: error
    });
  }

  // 2. Weryfikacja zadań
  try {
    const { data: tasks, error } = await supabase
      .from('micro_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    results.push({
      module: 'micro_tasks',
      status: tasks && tasks.length > 0 ? 'success' : 'warning',
      message: `Znaleziono ${tasks?.length || 0} zadań`,
      details: { count: tasks?.length || 0, recent: tasks?.[0] }
    });
  } catch (error) {
    results.push({
      module: 'micro_tasks',
      status: 'error',
      message: 'Błąd podczas weryfikacji zadań',
      details: error
    });
  }

  // 3. Weryfikacja wizualizacji przyszłego ja
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: futureSelf, error } = await supabase
      .from('future_self')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    results.push({
      module: 'future_self',
      status: futureSelf && futureSelf.length > 0 ? 'success' : 'warning',
      message: futureSelf && futureSelf.length > 0 
        ? 'Wizualizacja z dzisiaj istnieje' 
        : 'Brak dzisiejszej wizualizacji',
      details: futureSelf?.[0]
    });
  } catch (error) {
    results.push({
      module: 'future_self',
      status: 'error',
      message: 'Błąd podczas weryfikacji wizualizacji',
      details: error
    });
  }

  // 4. Weryfikacja intencji implementacyjnych
  try {
    const { data: intentions, error } = await supabase
      .from('implementation_intentions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (error) throw error;

    results.push({
      module: 'implementation_intentions',
      status: 'success',
      message: `${intentions?.length || 0} aktywnych intencji`,
      details: { count: intentions?.length || 0, items: intentions }
    });
  } catch (error) {
    results.push({
      module: 'implementation_intentions',
      status: 'error',
      message: 'Błąd podczas weryfikacji intencji',
      details: error
    });
  }

  // 5. Weryfikacja kontraktów zobowiązań
  try {
    const { data: contracts, error } = await supabase
      .from('commitment_contracts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    results.push({
      module: 'commitment_contracts',
      status: 'success',
      message: `${contracts?.length || 0} aktywnych kontraktów`,
      details: { count: contracts?.length || 0, items: contracts }
    });
  } catch (error) {
    results.push({
      module: 'commitment_contracts',
      status: 'error',
      message: 'Błąd podczas weryfikacji kontraktów',
      details: error
    });
  }

  // 6. Weryfikacja historii lootboxów
  try {
    const { data: lootboxHistory, error } = await supabase
      .from('lootbox_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    results.push({
      module: 'lootbox_history',
      status: 'success',
      message: `${lootboxHistory?.length || 0} wpisów w historii lootboxów`,
      details: { count: lootboxHistory?.length || 0, latest: lootboxHistory?.[0] }
    });
  } catch (error) {
    results.push({
      module: 'lootbox_history',
      status: 'error',
      message: 'Błąd podczas weryfikacji historii lootboxów',
      details: error
    });
  }

  // 7. Weryfikacja przeglądów tygodniowych
  try {
    const { data: reviews, error } = await supabase
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) throw error;

    results.push({
      module: 'weekly_reviews',
      status: 'success',
      message: `${reviews?.length || 0} przeglądów tygodniowych`,
      details: { count: reviews?.length || 0, latest: reviews?.[0] }
    });
  } catch (error) {
    results.push({
      module: 'weekly_reviews',
      status: 'error',
      message: 'Błąd podczas weryfikacji przeglądów',
      details: error
    });
  }

  // 8. Weryfikacja wskazówek primingowych
  try {
    const { data: cues, error } = await supabase
      .from('priming_cues')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true);

    if (error) throw error;

    results.push({
      module: 'priming_cues',
      status: 'success',
      message: `${cues?.length || 0} aktywnych wskazówek`,
      details: { count: cues?.length || 0, items: cues }
    });
  } catch (error) {
    results.push({
      module: 'priming_cues',
      status: 'error',
      message: 'Błąd podczas weryfikacji wskazówek',
      details: error
    });
  }

  // 9. Weryfikacja nagród
  try {
    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('granted_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    results.push({
      module: 'rewards',
      status: rewards && rewards.length > 0 ? 'success' : 'warning',
      message: `${rewards?.length || 0} nagród`,
      details: { count: rewards?.length || 0, latest: rewards?.[0] }
    });
  } catch (error) {
    results.push({
      module: 'rewards',
      status: 'error',
      message: 'Błąd podczas weryfikacji nagród',
      details: error
    });
  }

  // 10. Weryfikacja odznak
  try {
    const { data: badges, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);

    if (error) throw error;

    results.push({
      module: 'user_badges',
      status: badges && badges.length > 0 ? 'success' : 'warning',
      message: `${badges?.length || 0} odznak`,
      details: { count: badges?.length || 0, items: badges }
    });
  } catch (error) {
    results.push({
      module: 'user_badges',
      status: 'error',
      message: 'Błąd podczas weryfikacji odznak',
      details: error
    });
  }

  return results;
}

/**
 * Wyświetla wyniki weryfikacji w konsoli
 */
export function logVerificationResults(results: VerificationResult[]) {
  console.group('🔍 Weryfikacja zapisu danych');
  
  const errors = results.filter(r => r.status === 'error');
  const warnings = results.filter(r => r.status === 'warning');
  const successes = results.filter(r => r.status === 'success');

  console.log(`✅ Sukces: ${successes.length}`);
  console.log(`⚠️  Ostrzeżenia: ${warnings.length}`);
  console.log(`❌ Błędy: ${errors.length}`);
  console.log('');

  results.forEach(result => {
    const emoji = result.status === 'success' ? '✅' : 
                  result.status === 'warning' ? '⚠️' : '❌';
    
    console.group(`${emoji} ${result.module}`);
    console.log('Status:', result.status);
    console.log('Wiadomość:', result.message);
    if (result.details) {
      console.log('Szczegóły:', result.details);
    }
    console.groupEnd();
  });

  console.groupEnd();
}

/**
 * Tworzy raport HTML z wynikami weryfikacji
 */
export function createVerificationReport(results: VerificationResult[]): string {
  const errors = results.filter(r => r.status === 'error');
  const warnings = results.filter(r => r.status === 'warning');
  const successes = results.filter(r => r.status === 'success');

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #333;">Raport weryfikacji zapisu danych</h2>
      <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="padding: 10px; background: #d4edda; border-radius: 5px;">
          <strong>✅ Sukces:</strong> ${successes.length}
        </div>
        <div style="padding: 10px; background: #fff3cd; border-radius: 5px;">
          <strong>⚠️ Ostrzeżenia:</strong> ${warnings.length}
        </div>
        <div style="padding: 10px; background: #f8d7da; border-radius: 5px;">
          <strong>❌ Błędy:</strong> ${errors.length}
        </div>
      </div>
      
      <h3>Szczegóły:</h3>
      ${results.map(result => `
        <div style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
          <h4 style="margin: 0 0 10px 0;">
            ${result.status === 'success' ? '✅' : 
              result.status === 'warning' ? '⚠️' : '❌'} 
            ${result.module}
          </h4>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${result.status}</p>
          <p style="margin: 5px 0;"><strong>Wiadomość:</strong> ${result.message}</p>
          ${result.details ? `
            <details>
              <summary style="cursor: pointer;">Szczegóły</summary>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto;">
${JSON.stringify(result.details, null, 2)}
              </pre>
            </details>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;

  return html;
}