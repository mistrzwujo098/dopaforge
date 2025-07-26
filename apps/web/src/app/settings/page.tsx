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
import { createClient } from '@/lib/auth';
import { Moon, Sun, Bell, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [breakReminder, setBreakReminder] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const supabase = createClient;

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
        title: 'Settings updated',
        description: `Break reminders ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: 'Error updating settings',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      toast({
        title: 'Error signing out',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your DopaForge experience</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how DopaForge looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
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
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="break-reminder" className="text-base">
                      Break Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to take a break every 90 minutes
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
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    onClick={handleSignOut}
                    variant="destructive"
                    disabled={loading}
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
}