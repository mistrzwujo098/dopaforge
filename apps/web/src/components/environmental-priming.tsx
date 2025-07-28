// path: apps/web/src/components/environmental-priming.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@dopaforge/ui';
import { Sparkles, Clock, MapPin, Calendar, Eye } from 'lucide-react';
import type { Database } from '@dopaforge/db';

type PrimingCue = Database['public']['Tables']['priming_cues']['Row'];

interface EnvironmentalPrimingProps {
  cues: PrimingCue[];
  onCreateCue: (cue: {
    cue_type: 'time' | 'location' | 'event';
    cue_details: any;
    priming_message: string;
    active: boolean;
  }) => Promise<void>;
  onUpdateCue: (id: string, updates: { active?: boolean }) => Promise<void>;
  onDeleteCue: (id: string) => Promise<void>;
}

export function EnvironmentalPriming({
  cues,
  onCreateCue,
  onUpdateCue,
  onDeleteCue,
}: EnvironmentalPrimingProps) {
  const [open, setOpen] = useState(false);
  const [cueType, setCueType] = useState<'time' | 'location' | 'event'>('time');
  const [primingMessage, setPrimingMessage] = useState('');
  const [cueDetails, setCueDetails] = useState({
    time: '',
    location: '',
    event: '',
    days: [] as string[],
  });

  // Check for time-based cues
  useEffect(() => {
    const checkTimeCues = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'][now.getDay()];

      cues
        .filter(cue => cue.active && cue.cue_type === 'time')
        .forEach(cue => {
          const details = cue.cue_details as { time: string; days?: string[] };
          if (details.time === currentTime) {
            if (!details.days || details.days.length === 0 || details.days.includes(currentDay)) {
              // Show browser notification if permitted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('DopaForge Reminder', {
                  body: cue.priming_message,
                  icon: '/icon-192.png',
                });
              }
            }
          }
        });
    };

    // Check every minute
    const interval = setInterval(checkTimeCues, 60000);
    checkTimeCues(); // Check immediately

    return () => clearInterval(interval);
  }, [cues]);

  const handleSubmit = async () => {
    const details: any = {};
    
    if (cueType === 'time') {
      details.time = cueDetails.time;
      details.days = cueDetails.days;
    } else if (cueType === 'location') {
      details.location = cueDetails.location;
    } else if (cueType === 'event') {
      details.event = cueDetails.event;
    }

    await onCreateCue({
      cue_type: cueType,
      cue_details: details,
      priming_message: primingMessage,
      active: true,
    });

    setOpen(false);
    setPrimingMessage('');
    setCueDetails({ time: '', location: '', event: '', days: [] });

    // Request notification permission for time-based cues
    if (cueType === 'time' && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const getCueIcon = (type: string) => {
    switch (type) {
      case 'time':
        return Clock;
      case 'location':
        return MapPin;
      case 'event':
        return Calendar;
      default:
        return Sparkles;
    }
  };

  const formatCueDetails = (type: string, details: any) => {
    switch (type) {
      case 'time':
        const days = details.days?.length > 0 ? ` (${details.days.join(', ')})` : ' (daily)';
        return `${details.time}${days}`;
      case 'location':
        return details.location;
      case 'event':
        return details.event;
      default:
        return '';
    }
  };

  const weekDays = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Environmental Priming
        </CardTitle>
        <CardDescription>
          Set up cues in your environment to trigger positive behaviors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Add Priming Cue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Priming Cue</DialogTitle>
              <DialogDescription>
                Set up an environmental trigger to prime positive behavior
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Cue Type</Label>
                <Select value={cueType} onValueChange={(v: any) => setCueType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="time">Time-based</SelectItem>
                    <SelectItem value="location">Location-based</SelectItem>
                    <SelectItem value="event">Event-based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cueType === 'time' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={cueDetails.time}
                      onChange={(e) => setCueDetails({ ...cueDetails, time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Days (leave empty for daily)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {weekDays.map(day => (
                        <label key={day} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={cueDetails.days.includes(day)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCueDetails({ ...cueDetails, days: [...cueDetails.days, day] });
                              } else {
                                setCueDetails({ ...cueDetails, days: cueDetails.days.filter(d => d !== day) });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm capitalize">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {cueType === 'location' && (
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={cueDetails.location}
                    onChange={(e) => setCueDetails({ ...cueDetails, location: e.target.value })}
                    placeholder="e.g., Home office, Gym, Kitchen"
                  />
                </div>
              )}

              {cueType === 'event' && (
                <div className="space-y-2">
                  <Label htmlFor="event">Event</Label>
                  <Input
                    id="event"
                    value={cueDetails.event}
                    onChange={(e) => setCueDetails({ ...cueDetails, event: e.target.value })}
                    placeholder="e.g., After coffee, Before bed, Start of workday"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Priming Message</Label>
                <Textarea
                  id="message"
                  value={primingMessage}
                  onChange={(e) => setPrimingMessage(e.target.value)}
                  placeholder="e.g., Time to focus! What's your ONE important task?"
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={!primingMessage || (cueType === 'time' && !cueDetails.time)}
                variant="gradient"
              >
                Create Cue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          {cues.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">
              No priming cues yet. Add one to get started!
            </p>
          ) : (
            <AnimatePresence>
              {cues.map((cue) => {
                const Icon = getCueIcon(cue.cue_type);
                
                return (
                  <motion.div
                    key={cue.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`p-3 border rounded-lg space-y-2 ${!cue.active && 'opacity-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">{cue.priming_message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCueDetails(cue.cue_type, cue.cue_details)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cue.active}
                          onCheckedChange={(checked) => onUpdateCue(cue.id, { active: checked })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteCue(cue.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Time-based cues will show notifications. Location and event cues serve as visual reminders.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}