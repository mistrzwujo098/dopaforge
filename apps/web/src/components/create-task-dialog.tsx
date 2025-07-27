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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  Checkbox,
} from '@dopaforge/ui';
import { Plus, Sparkles, Clock, Zap, Brain } from 'lucide-react';
import { breakdownTask } from '@/lib/ai-client';
import { useToast } from '@/hooks/useToast';

interface CreateTaskDialogProps {
  onCreateTask: (title: string, estMinutes: number) => Promise<void>;
}

interface AIGeneratedTask {
  title: string;
  estimatedMinutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  order: number;
}

export function CreateTaskDialog({ onCreateTask }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [estMinutes, setEstMinutes] = useState([30]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  // AI task breakdown state
  const [showAIBreakdown, setShowAIBreakdown] = useState(false);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [availableTime, setAvailableTime] = useState([60]);
  const [aiTasks, setAiTasks] = useState<AIGeneratedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);

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

  const handleAIBreakdown = async () => {
    if (!title.trim()) return;
    
    setAiLoading(true);
    try {
      const tasks = await breakdownTask(title, {
        energyLevel,
        availableTime: availableTime[0],
        experienceLevel: 'intermediate'
      });
      
      setAiTasks(tasks);
      setSelectedTasks(new Set(tasks.map((_, i) => i)));
      setShowAIBreakdown(true);
    } catch (error) {
      console.error('AI breakdown error:', error);
      toast({
        title: 'AI Breakdown Failed',
        description: 'Could not generate task breakdown. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateSelectedTasks = async () => {
    setLoading(true);
    try {
      const tasksToCreate = aiTasks.filter((_, index) => selectedTasks.has(index));
      
      for (const task of tasksToCreate) {
        await onCreateTask(task.title, task.estimatedMinutes);
      }
      
      toast({
        title: 'Tasks Created!',
        description: `Successfully created ${tasksToCreate.length} micro-tasks`,
      });
      
      // Reset dialog
      setTitle('');
      setEstMinutes([30]);
      setAiTasks([]);
      setSelectedTasks(new Set());
      setShowAIBreakdown(false);
      setOpen(false);
    } catch (error) {
      console.error('Error creating tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to create some tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskSelection = (index: number) => {
    const newSelection = new Set(selectedTasks);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedTasks(newSelection);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="gradient" size="lg" className="shadow-lg" data-hint="create-task">
            <Plus className="mr-2 h-5 w-5" />
            New Micro Task
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className={showAIBreakdown ? "sm:max-w-[600px]" : "sm:max-w-[425px]"}>
        <DialogHeader>
          <DialogTitle>
            {showAIBreakdown ? 'AI-Generated Tasks' : 'Create Micro Task'}
          </DialogTitle>
          <DialogDescription>
            {showAIBreakdown 
              ? 'Select which tasks you want to create'
              : 'Break down your work into small, focused tasks (≤ 90 min)'
            }
          </DialogDescription>
        </DialogHeader>
        
        {!showAIBreakdown ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Write project proposal introduction"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading && !aiLoading) {
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
              
              {/* AI Breakdown Options */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>AI Task Breakdown</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="energy">Your Energy Level</Label>
                    <Select value={energyLevel} onValueChange={(value: any) => setEnergyLevel(value)}>
                      <SelectTrigger id="energy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3" />
                            High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="time">Available Time</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        id="time"
                        min={30}
                        max={240}
                        step={30}
                        value={availableTime}
                        onValueChange={setAvailableTime}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">{availableTime[0]}m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading || aiLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAIBreakdown}
                disabled={!title.trim() || loading || aiLoading}
              >
                {aiLoading ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Breakdown
                  </>
                )}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim() || loading || aiLoading}
                variant="gradient"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
              {aiTasks.map((task, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    selectedTasks.has(index) ? 'border-primary' : ''
                  }`}
                  onClick={() => toggleTaskSelection(index)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTasks.has(index)}
                        onCheckedChange={() => toggleTaskSelection(index)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.difficulty === 'easy' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : task.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                              {task.difficulty}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimatedMinutes}m
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAIBreakdown(false);
                  setAiTasks([]);
                  setSelectedTasks(new Set());
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateSelectedTasks}
                disabled={selectedTasks.size === 0 || loading}
                variant="gradient"
              >
                {loading 
                  ? 'Creating...' 
                  : `Create ${selectedTasks.size} Task${selectedTasks.size !== 1 ? 's' : ''}`
                }
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}