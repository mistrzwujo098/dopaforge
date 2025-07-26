// path: apps/web/src/components/create-task-dialog.tsx
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
  DialogTrigger,
  Input,
  Label,
  Slider,
} from '@dopaforge/ui';
import { Plus } from 'lucide-react';

interface CreateTaskDialogProps {
  onCreateTask: (title: string, estMinutes: number) => Promise<void>;
}

export function CreateTaskDialog({ onCreateTask }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [estMinutes, setEstMinutes] = useState([30]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await onCreateTask(title, estMinutes[0]);
      setTitle('');
      setEstMinutes([30]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="gradient" size="lg" className="shadow-lg">
            <Plus className="mr-2 h-5 w-5" />
            New Micro Task
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Micro Task</DialogTitle>
          <DialogDescription>
            Break down your work into small, focused tasks (≤ 90 min)
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="e.g., Write project proposal introduction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleCreate();
                }
              }}
              aria-label="Task title"
              aria-required="true"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="minutes">Estimated Time</Label>
              <span className="text-sm font-medium">{estMinutes[0]} min</span>
            </div>
            <Slider
              id="minutes"
              min={15}
              max={90}
              step={15}
              value={estMinutes}
              onValueChange={setEstMinutes}
              className="w-full"
              aria-label="Estimated time in minutes"
              aria-valuemin={15}
              aria-valuemax={90}
              aria-valuenow={estMinutes[0]}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15 min</span>
              <span>90 min</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || loading}
            variant="gradient"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}