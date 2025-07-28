'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { DataVerificationPanel } from '@/components/data-verification-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@dopaforge/ui';
import { Shield, Database, Activity } from 'lucide-react';

export default function AdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Panel administracyjny
          </h1>
          <p className="text-muted-foreground">
            Narzędzia diagnostyczne i administracyjne dla DopaForge
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Status aplikacji
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktywna</div>
              <p className="text-xs text-muted-foreground mt-1">
                Wszystkie systemy działają
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Baza danych
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Supabase</div>
              <p className="text-xs text-muted-foreground mt-1">
                PostgreSQL z RLS
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                ID użytkownika
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono break-all">{user.id}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.email || 'Brak emaila'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Verification Panel */}
        <DataVerificationPanel />

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instrukcje dla administratora</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Wykonanie migracji z danymi testowymi</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Aby dodać dane testowe do pustych tabel, wykonaj następującą migrację w Supabase:
              </p>
              <code className="block p-3 bg-muted rounded-md text-xs">
                supabase/migrations/20241228000002_add_test_data.sql
              </code>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Weryfikacja danych</h3>
              <p className="text-sm text-muted-foreground">
                Użyj panelu weryfikacji powyżej, aby sprawdzić czy wszystkie moduły aplikacji
                poprawnie zapisują dane do bazy. Panel sprawdza 10 głównych tabel i generuje
                raport z wynikami.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Rozwiązywanie problemów</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Jeśli moduł pokazuje "error" - sprawdź polityki RLS dla danej tabeli</li>
                <li>Jeśli moduł pokazuje "warning" - może to oznaczać brak danych (normalne dla nowych użytkowników)</li>
                <li>Wszystkie moduły powinny pokazywać "success" po normalnym użytkowaniu aplikacji</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Uprawnienia MCP</h3>
              <p className="text-sm text-muted-foreground">
                Obecnie MCP Supabase ma tylko uprawnienia do odczytu (SELECT). 
                Aby wykonać INSERT/UPDATE/DELETE, użyj migracji SQL lub Supabase Dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}