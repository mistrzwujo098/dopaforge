'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  RadioGroup,
  RadioGroupItem,
  Label,
  Checkbox,
} from '@dopaforge/ui';
import { Download, FileJson, FileText, Shield, ArrowLeft } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { 
  getTodayTasks, 
  getUserProfile, 
  getImplementationIntentions,
  getCommitmentContracts,
  getPrimingCues,
} from '@/lib/db-client';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { t } from '@/lib/i18n';
import { staggerContainer, staggerItem } from '@/lib/animations';

type ExportFormat = 'json' | 'csv';

interface ExportOptions {
  tasks: boolean;
  profile: boolean;
  stats: boolean;
  settings: boolean;
  psychology: boolean;
}

export default function DataExportPage() {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('json');
  const [options, setOptions] = useState<ExportOptions>({
    tasks: true,
    profile: true,
    stats: true,
    settings: true,
    psychology: true,
  });
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
    }
  }, [user, router]);

  const handleExport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data: any = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
      };

      // Fetch selected data
      if (options.tasks) {
        const supabase = createSupabaseBrowser();
        const { data: allTasks } = await supabase
          .from('micro_tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        data.tasks = allTasks || [];
      }

      if (options.profile) {
        const profile = await getUserProfile(user.id);
        data.profile = profile;
      }

      if (options.stats) {
        const supabase = createSupabaseBrowser();
        const { data: sessions } = await supabase
          .from('focus_sessions')
          .select('*')
          .eq('user_id', user.id);
        
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);
        
        data.stats = {
          sessions: sessions || [],
          achievements: achievements || [],
        };
      }

      if (options.settings) {
        // Get all localStorage settings
        const settings: any = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !key.includes('supabase')) {
            settings[key] = localStorage.getItem(key);
          }
        }
        data.settings = settings;
      }

      if (options.psychology) {
        const [intentions, contracts, cues] = await Promise.all([
          getImplementationIntentions(user.id),
          getCommitmentContracts(user.id),
          getPrimingCues(user.id),
        ]);
        
        data.psychology = {
          implementationIntentions: intentions,
          commitmentContracts: contracts,
          primingCues: cues,
        };
      }

      // Export based on format
      if (format === 'json') {
        exportAsJSON(data);
      } else {
        exportAsCSV(data);
      }

      toast({
        title: 'Eksport zakończony',
        description: 'Twoje dane zostały wyeksportowane',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('common.error'),
        description: 'Nie udało się wyeksportować danych',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAsJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dopaforge-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = (data: any) => {
    // Convert tasks to CSV
    if (data.tasks && data.tasks.length > 0) {
      const headers = Object.keys(data.tasks[0]).join(',');
      const rows = data.tasks.map((task: any) => 
        Object.values(task).map(v => 
          typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dopaforge-tasks-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // For other data, export as JSON
    const otherData = { ...data };
    delete otherData.tasks;
    if (Object.keys(otherData).length > 0) {
      exportAsJSON(otherData);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-6 sm:p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Eksport danych</h1>
          <p className="text-muted-foreground">
            Pobierz wszystkie swoje dane z DopaForge
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6"
        >
          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Twoje dane należą do Ciebie
                </CardTitle>
                <CardDescription>
                  Możesz w każdej chwili pobrać kopię wszystkich swoich danych. 
                  Eksport zawiera wszystkie informacje przechowywane w DopaForge.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Format eksportu</CardTitle>
                <CardDescription>
                  Wybierz format, w którym chcesz pobrać dane
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={format}
                  onValueChange={(value) => setFormat(value as ExportFormat)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="json" id="json" />
                    <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                      <FileJson className="h-4 w-4" />
                      JSON (kompletne dane)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      CSV (zadania) + JSON (pozostałe)
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle>Dane do eksportu</CardTitle>
                <CardDescription>
                  Wybierz, które dane chcesz wyeksportować
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tasks"
                    checked={options.tasks}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, tasks: checked as boolean })
                    }
                  />
                  <Label htmlFor="tasks" className="cursor-pointer">
                    Zadania (wszystkie mikro-zadania)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="profile"
                    checked={options.profile}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, profile: checked as boolean })
                    }
                  />
                  <Label htmlFor="profile" className="cursor-pointer">
                    Profil (dane użytkownika, poziom, XP)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stats"
                    checked={options.stats}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, stats: checked as boolean })
                    }
                  />
                  <Label htmlFor="stats" className="cursor-pointer">
                    Statystyki (sesje, osiągnięcia)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="settings"
                    checked={options.settings}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, settings: checked as boolean })
                    }
                  />
                  <Label htmlFor="settings" className="cursor-pointer">
                    Ustawienia (preferencje aplikacji)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="psychology"
                    checked={options.psychology}
                    onCheckedChange={(checked) => 
                      setOptions({ ...options, psychology: checked as boolean })
                    }
                  />
                  <Label htmlFor="psychology" className="cursor-pointer">
                    Dane psychologiczne (intencje, kontrakty, bodźce)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Button
              onClick={handleExport}
              disabled={loading || !Object.values(options).some(v => v)}
              variant="gradient"
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Download className="h-5 w-5" />
                  </motion.div>
                  Eksportowanie...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Eksportuj dane
                </>
              )}
            </Button>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Uwaga:</strong> Eksport może zawierać wrażliwe dane osobiste. 
                  Przechowuj plik w bezpiecznym miejscu i nie udostępniaj go osobom trzecim.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}