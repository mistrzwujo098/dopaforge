'use client';

import { useState } from 'react';
import { Button } from '@dopaforge/ui/components/button';
import { Input } from '@dopaforge/ui/components/input';
import { Textarea } from '@dopaforge/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@dopaforge/ui/components/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@dopaforge/ui/components/card';
import { Label } from '@dopaforge/ui/components/label';
import { Switch } from '@dopaforge/ui/components/switch';
import { useToast } from '@dopaforge/ui/hooks/use-toast';
import { Calendar, Clock, Trash2, Bell, BellOff } from 'lucide-react';
import { createScheduledCue, updateScheduledCue, deleteScheduledCue } from '@dopaforge/db';

interface ScheduledCue {
  id: string;
  title: string;
  message: string;
  schedule_type: 'daily' | 'weekly' | 'specific';
  schedule_time: string;
  schedule_days: number[] | null;
  specific_date: string | null;
  active: boolean;
  last_triggered_at: string | null;
}

interface CueSchedulerProps {
  cues: ScheduledCue[];
  onUpdate: () => void;
  userId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function CueScheduler({ cues, onUpdate, userId }: CueSchedulerProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newCue, setNewCue] = useState({
    title: '',
    message: '',
    schedule_type: 'daily' as const,
    schedule_time: '09:00',
    schedule_days: [1, 2, 3, 4, 5], // Weekdays by default
    specific_date: '',
  });

  const handleCreate = async () => {
    try {
      await createScheduledCue(userId, {
        title: newCue.title,
        message: newCue.message,
        schedule_type: newCue.schedule_type,
        schedule_time: newCue.schedule_time,
        schedule_days: newCue.schedule_type === 'weekly' ? newCue.schedule_days : undefined,
        specific_date: newCue.schedule_type === 'specific' ? newCue.specific_date : undefined,
      });

      toast({
        title: 'Reminder created',
        description: 'Your scheduled reminder has been set up.',
      });

      setIsAdding(false);
      setNewCue({
        title: '',
        message: '',
        schedule_type: 'daily',
        schedule_time: '09:00',
        schedule_days: [1, 2, 3, 4, 5],
        specific_date: '',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await updateScheduledCue(id, { active });
      toast({
        title: active ? 'Reminder activated' : 'Reminder deactivated',
        description: active ? 'You will receive notifications for this reminder.' : 'Notifications paused for this reminder.',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update reminder',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScheduledCue(id);
      toast({
        title: 'Reminder deleted',
        description: 'The scheduled reminder has been removed.',
      });
      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive',
      });
    }
  };

  const formatSchedule = (cue: ScheduledCue) => {
    const time = new Date(`2000-01-01T${cue.schedule_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    switch (cue.schedule_type) {
      case 'daily':
        return `Daily at ${time}`;
      case 'weekly':
        const days = cue.schedule_days?.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ');
        return `${days} at ${time}`;
      case 'specific':
        return `${new Date(cue.specific_date!).toLocaleDateString()} at ${time}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Scheduled Reminders
        </CardTitle>
        <CardDescription>
          Set up automated reminders to keep you on track
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {cues.map((cue) => (
          <div key={cue.id} className="flex items-start justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{cue.title}</h4>
                {cue.active ? (
                  <Bell className="h-4 w-4 text-green-500" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{cue.message}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatSchedule(cue)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={cue.active}
                onCheckedChange={(active) => handleToggle(cue.id, active)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(cue.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {isAdding ? (
          <div className="space-y-4 p-4 border rounded-lg">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newCue.title}
                onChange={(e) => setNewCue({ ...newCue, title: e.target.value })}
                placeholder="Morning motivation"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={newCue.message}
                onChange={(e) => setNewCue({ ...newCue, message: e.target.value })}
                placeholder="Time to tackle your most important task!"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="type">Schedule Type</Label>
              <Select
                value={newCue.schedule_type}
                onValueChange={(value: 'daily' | 'weekly' | 'specific') => 
                  setNewCue({ ...newCue, schedule_type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="specific">Specific Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newCue.schedule_time}
                onChange={(e) => setNewCue({ ...newCue, schedule_time: e.target.value })}
              />
            </div>

            {newCue.schedule_type === 'weekly' && (
              <div>
                <Label>Days</Label>
                <div className="flex gap-2 mt-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      variant={newCue.schedule_days.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const days = newCue.schedule_days.includes(day.value)
                          ? newCue.schedule_days.filter(d => d !== day.value)
                          : [...newCue.schedule_days, day.value];
                        setNewCue({ ...newCue, schedule_days: days });
                      }}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {newCue.schedule_type === 'specific' && (
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newCue.specific_date}
                  onChange={(e) => setNewCue({ ...newCue, specific_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newCue.title || !newCue.message}>
                Create Reminder
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="w-full">
            Add Reminder
          </Button>
        )}
      </CardContent>
    </Card>
  );
}