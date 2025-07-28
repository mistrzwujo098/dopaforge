'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Input,
  Label
} from '@dopaforge/ui';
import { 
  Sparkles,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { t } from '@/lib/i18n';

interface FirstTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (taskName: string) => Promise<void>;
}

export function FirstTaskModal({ open, onClose, onCreateTask }: FirstTaskModalProps) {
  const [taskName, setTaskName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const exampleTasks = t('onboarding.exampleTasks') as unknown as string[];

  const handleSubmit = async () => {
    const finalTaskName = taskName || selectedExample;
    if (!finalTaskName) return;

    setLoading(true);
    try {
      await onCreateTask(finalTaskName);
      onClose();
    } catch (error) {
      console.error('Error creating first task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setSelectedExample(example);
    setTaskName(example);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            {t('onboarding.firstTaskTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <p className="text-muted-foreground">
            {t('onboarding.firstTaskDesc')}
          </p>

          {/* Example tasks */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Wybierz przykład lub napisz własne:
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {exampleTasks.map((example, idx) => (
                <motion.button
                  key={example}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleExampleClick(example)}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedExample === example
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 
                      className={`h-5 w-5 ${
                        selectedExample === example
                          ? 'text-primary'
                          : 'text-gray-400'
                      }`}
                    />
                    <span className="font-medium">{example}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom task input */}
          <div className="space-y-2">
            <Label htmlFor="custom-task">
              Lub wpisz własne zadanie:
            </Label>
            <Input
              id="custom-task"
              value={taskName}
              onChange={(e) => {
                setTaskName(e.target.value);
                setSelectedExample(null);
              }}
              placeholder="np. Posprzątaj szufladę"
              className="text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && taskName) {
                  handleSubmit();
                }
              }}
            />
          </div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"
          >
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Wskazówka:</strong> Zacznij od czegoś małego i konkretnego. 
              Zadanie powinno zająć 2-25 minut.
            </p>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (!taskName && !selectedExample)}
              className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
            >
              <Plus className="h-4 w-4" />
              {loading ? t('common.loading') : t('dashboard.createTask')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}