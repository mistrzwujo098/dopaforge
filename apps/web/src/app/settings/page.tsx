// path: apps/web/src/app/settings/page.tsx
'use client';

// Prevent static generation during build
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Switch } from '@dopaforge/ui';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { useThemeStore } from '@/stores/theme';
import { getUserProfile, updateUserProfile } from '@dopaforge/db';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { Moon, Sun, Bell, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [breakReminder, setBreakReminder] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [taskNotifications, setTaskNotifications] = useState(true);
  const [motivationalQuotes, setMotivationalQuotes] = useState(true);
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(true);
  const [weekStartsMonday, setWeekStartsMonday] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useThemeStore();

  useEffect(() => {
    if (user) loadSettings();
    document.documentElement.classList.toggle('dark', darkMode);
  }, [user, darkMode]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setBreakReminder(profile.break_reminder);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBreakReminderChange = async (value: boolean) => {
    if (!user) return;

    setBreakReminder(value);
    try {
      await updateUserProfile(user.id, { break_reminder: value });
      toast({
        title: 'Ustawienia zaktualizowane',
        description: `Przypomnienia o przerwach ${value ? 'włączone' : 'wyłączone'}`,
      });
    } catch (error) {
      toast({
        title: 'Błąd aktualizacji ustawień',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseBrowser();
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      toast({
        title: 'Błąd wylogowywania',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <main id="main-content" className="container mx-auto px-4 py-6 sm:p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Ustawienia</h1>
          <p className="text-muted-foreground">Spersonalizuj DopaForge według swoich potrzeb</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Wygląd</CardTitle>
                <CardDescription>Dostosuj wygląd DopaForge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      Tryb ciemny
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Przełącz między jasnym a ciemnym motywem
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {darkMode ? (
                      <Moon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Sun className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={toggleDarkMode}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Powiadomienia</CardTitle>
                <CardDescription>Zarządzaj swoimi preferencjami powiadomień</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="break-reminder" className="text-base">
                      Przypomnienia o przerwach
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Otrzymuj przypomnienia o przerwach co 90 minut
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      id="break-reminder"
                      checked={breakReminder}
                      onCheckedChange={handleBreakReminderChange}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-effects" className="text-base">
                      Efekty dźwiękowe
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Dźwięki przy ukończeniu zadań i nagrodach
                    </p>
                  </div>
                  <Switch
                    id="sound-effects"
                    checked={soundEffects}
                    onCheckedChange={setSoundEffects}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="task-notifications" className="text-base">
                      Powiadomienia o zadaniach
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Przypomnienia o zaplanowanych zadaniach
                    </p>
                  </div>
                  <Switch
                    id="task-notifications"
                    checked={taskNotifications}
                    onCheckedChange={setTaskNotifications}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Produktywność</CardTitle>
                <CardDescription>Dostosuj funkcje wspierające produktywność</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="motivational-quotes" className="text-base">
                      Cytaty motywacyjne
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Wyświetlaj inspirujące cytaty w interfejsie
                    </p>
                  </div>
                  <Switch
                    id="motivational-quotes"
                    checked={motivationalQuotes}
                    onCheckedChange={setMotivationalQuotes}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save" className="text-base">
                      Automatyczny zapis
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Zapisuj szkice zadań automatycznie
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSaveDrafts}
                    onCheckedChange={setAutoSaveDrafts}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="week-start" className="text-base">
                      Tydzień zaczyna się w poniedziałek
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Ustaw początek tygodnia w kalendarzu
                    </p>
                  </div>
                  <Switch
                    id="week-start"
                    checked={weekStartsMonday}
                    onCheckedChange={setWeekStartsMonday}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Konto</CardTitle>
                <CardDescription>Zarządzaj ustawieniami konta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">ID użytkownika</p>
                      <p className="text-sm text-muted-foreground font-mono">{user?.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Data dołączenia</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('pl-PL') : 'Nieznana'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => router.push('/data-export')}
                    variant="outline"
                    className="w-full"
                  >
                    Eksportuj moje dane
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    disabled={loading}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loading ? 'Wylogowywanie...' : 'Wyloguj się'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Prywatność i bezpieczeństwo</CardTitle>
                <CardDescription>Zarządzaj swoimi danymi i prywatnością</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/privacy')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Polityka prywatności
                  </Button>
                  <Button
                    onClick={() => router.push('/terms')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Warunki korzystania
                  </Button>
                  <Button
                    onClick={() => router.push('/help')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Centrum pomocy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}