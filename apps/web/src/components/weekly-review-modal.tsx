// path: apps/web/src/components/weekly-review-modal.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Slider,
} from '@dopaforge/ui';
import { BarChart3, Brain, Flame, Heart } from 'lucide-react';

interface WeeklyReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (review: {
    satisfaction: number;
    burnout: number;
    addiction: number;
    reflections: string;
  }) => Promise<void>;
  weekStats?: {
    tasksCompleted: number;
    totalXP: number;
    streakDays: number;
  };
}

const RATING_LABELS = {
  satisfaction: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
  burnout: ['No Burnout', 'Slight Fatigue', 'Moderate', 'High Stress', 'Severe Burnout'],
  addiction: ['Healthy Balance', 'Slight Concern', 'Moderate', 'High Dependency', 'Compulsive'],
};

export function WeeklyReviewModal({
  open,
  onClose,
  onSubmit,
  weekStats,
}: WeeklyReviewModalProps) {
  const [satisfaction, setSatisfaction] = useState([3]);
  const [burnout, setBurnout] = useState([2]);
  const [addiction, setAddiction] = useState([1]);
  const [reflections, setReflections] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        satisfaction: satisfaction[0],
        burnout: burnout[0],
        addiction: addiction[0],
        reflections,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const showWarning = addiction[0] >= 4 || burnout[0] >= 4;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-4"
          >
            <BarChart3 className="h-12 w-12 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl text-center">Weekly Check-In</DialogTitle>
          <DialogDescription className="text-center">
            Let's reflect on your week and ensure you're maintaining a healthy balance
          </DialogDescription>
        </DialogHeader>

        {weekStats && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{weekStats.tasksCompleted}</p>
                  <p className="text-sm text-muted-foreground">Tasks Done</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{weekStats.totalXP}</p>
                  <p className="text-sm text-muted-foreground">XP Earned</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{weekStats.streakDays}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              <Label>Overall Satisfaction</Label>
            </div>
            <Slider
              value={satisfaction}
              onValueChange={setSatisfaction}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-center text-muted-foreground">
              {RATING_LABELS.satisfaction[satisfaction[0] - 1]}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <Label>Burnout Level</Label>
            </div>
            <Slider
              value={burnout}
              onValueChange={setBurnout}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-center text-muted-foreground">
              {RATING_LABELS.burnout[burnout[0] - 1]}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <Label>App Dependency</Label>
            </div>
            <Slider
              value={addiction}
              onValueChange={setAddiction}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <p className="text-sm text-center text-muted-foreground">
              {RATING_LABELS.addiction[addiction[0] - 1]}
            </p>
          </div>

          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ We notice you're experiencing high stress or dependency. Consider taking a break or adjusting your goals.
              </p>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reflections">Reflections (optional)</Label>
            <textarea
              id="reflections"
              placeholder="What went well? What could be improved?"
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              className="min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="gradient"
          >
            {loading ? 'Saving...' : 'Complete Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}