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
import { t } from '@/lib/i18n';

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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.appearance')}</CardTitle>
                <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      {t('settings.darkTheme')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.darkThemeDesc')}
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
                <CardTitle>{t('settings.notifications')}</CardTitle>
                <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="break-reminder" className="text-base">
                      {t('settings.breakReminders')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.breakRemindersDesc')}
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
                      {t('settings.enableSounds')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.soundsDesc')}
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
                      {t('settings.taskNotifications')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.taskNotificationsDesc')}
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
                <CardTitle>{t('settings.productivity')}</CardTitle>
                <CardDescription>{t('settings.productivityDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="motivational-quotes" className="text-base">
                      {t('settings.motivationalQuotes')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.motivationalQuotesDesc')}
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
                      {t('settings.autoSave')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.autoSaveDesc')}
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
                      {t('settings.weekStartsMonday')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.weekStartsMondayDesc')}
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
                <CardTitle>{t('settings.account')}</CardTitle>
                <CardDescription>{t('settings.accountDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('settings.email')}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('settings.userId')}</p>
                      <p className="text-sm text-muted-foreground font-mono">{user?.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{t('settings.joinDate')}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('pl-PL') : t('common.unknown')}
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
                    {t('settings.exportData')}
                  </Button>
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    disabled={loading}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loading ? t('settings.signingOut') : t('common.logout')}
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
                <CardTitle>{t('settings.privacySecurity')}</CardTitle>
                <CardDescription>{t('settings.privacySecurityDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/privacy')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {t('settings.privacyPolicy')}
                  </Button>
                  <Button
                    onClick={() => router.push('/terms')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {t('common.terms')}
                  </Button>
                  <Button
                    onClick={() => router.push('/help')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {t('settings.helpCenter')}
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