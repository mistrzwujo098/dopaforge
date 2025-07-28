// path: apps/web/src/components/future-self-modal.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@dopaforge/ui';
import { Sunrise } from 'lucide-react';

interface FutureSelfModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (visualization: string, feelings: string[]) => Promise<void>;
}

export function FutureSelfModal({ open, onClose, onSubmit }: FutureSelfModalProps) {
  const [visualization, setVisualization] = useState('');
  const [feelings, setFeelings] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const validFeelings = feelings.filter((f) => f.trim());
    if (!visualization.trim() || validFeelings.length < 3) return;

    setLoading(true);
    try {
      await onSubmit(visualization, validFeelings);
      setVisualization('');
      setFeelings(['', '', '']);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const updateFeeling = (index: number, value: string) => {
    const newFeelings = [...feelings];
    newFeelings[index] = value;
    setFeelings(newFeelings);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-lg opacity-50" />
        <DialogHeader className="relative">
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto mb-4"
          >
            <Sunrise className="h-12 w-12 text-orange-500" />
          </motion.div>
          <DialogTitle className="text-xl">Poranna Wizualizacja</DialogTitle>
          <DialogDescription>
            Poświęć chwilę, aby połączyć się ze swoim przyszłym ja. Jak będziesz się czuć na koniec dnia?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 relative">
          <div className="grid gap-2">
            <Label htmlFor="visualization">Wyobraź sobie siebie po ukończonych zadaniach</Label>
            <textarea
              id="visualization"
              placeholder="Wyobraź sobie siebie na koniec dnia, po ukończeniu zadań. Co widzisz? Jak się czujesz?"
              value={visualization}
              onChange={(e) => setVisualization(e.target.value)}
              className="min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="grid gap-2">
            <Label>Trzy uczucia, których doświadczy twoje przyszłe ja</Label>
            {feelings.map((feeling, index) => (
              <motion.input
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                type="text"
                placeholder={`Uczucie ${index + 1} (np. duma, energia, spokój)`}
                value={feeling}
                onChange={(e) => updateFeeling(index, e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            ))}
          </div>
        </div>
        <DialogFooter className="relative">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Pomiń na dziś
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !visualization.trim() ||
              feelings.filter((f) => f.trim()).length < 3 ||
              loading
            }
            variant="gradient"
          >
            {loading ? 'Zapisywanie...' : 'Ustaw intencję'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}