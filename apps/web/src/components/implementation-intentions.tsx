// path: apps/web/src/components/implementation-intentions.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
} from '@dopaforge/ui';
import { Plus, Clock, MapPin, Coffee, X } from 'lucide-react';

interface Intention {
  id: string;
  trigger_type: 'time' | 'location' | 'habit';
  trigger_value: string;
  action: string;
  active: boolean;
}

interface ImplementationIntentionsProps {
  intentions: Intention[];
  onAdd: (intention: Omit<Intention, 'id' | 'active'>) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onToggle: (id: string, active: boolean) => Promise<void>;
}

const TRIGGER_ICONS = {
  time: Clock,
  location: MapPin,
  habit: Coffee,
};

const TRIGGER_LABELS = {
  time: 'Czas',
  location: 'Miejsce',
  habit: 'Po nawyku',
};

export function ImplementationIntentions({
  intentions,
  onAdd,
  onRemove,
  onToggle,
}: ImplementationIntentionsProps) {
  const [open, setOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<'time' | 'location' | 'habit'>('time');
  const [triggerValue, setTriggerValue] = useState('');
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!triggerValue.trim() || !action.trim()) return;

    setLoading(true);
    try {
      await onAdd({
        trigger_type: triggerType,
        trigger_value: triggerValue,
        action,
      });
      setTriggerValue('');
      setAction('');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Skrypty Jeśli-To</CardTitle>
          <CardDescription>
            Utwórz automatyczne wyzwalacze dla swoich zadań
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj Skrypt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Utwórz Intencję Implementacyjną</DialogTitle>
              <DialogDescription>
                Gdy X się wydarzy, zrobię Y
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Typ wyzwalacza</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['time', 'location', 'habit'] as const).map((type) => {
                    const Icon = TRIGGER_ICONS[type];
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={triggerType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTriggerType(type)}
                      >
                        <Icon className="mr-1 h-3 w-3" />
                        {TRIGGER_LABELS[type]}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trigger">
                  {triggerType === 'time' && 'Kiedy (np. 9:00)'}
                  {triggerType === 'location' && 'Gdzie (np. przy biurku)'}
                  {triggerType === 'habit' && 'Po (np. porannej kawie)'}
                </Label>
                <Input
                  id="trigger"
                  value={triggerValue}
                  onChange={(e) => setTriggerValue(e.target.value)}
                  placeholder={
                    triggerType === 'time'
                      ? '9:00'
                      : triggerType === 'location'
                      ? 'przy biurku'
                      : 'porannej kawie'
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="action">Zrobię...</Label>
                <Input
                  id="action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="napisać 100 słów"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Anuluj
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!triggerValue.trim() || !action.trim() || loading}
              >
                {loading ? 'Tworzenie...' : 'Utwórz Skrypt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {intentions.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              Brak skryptów. Utwórz swoją pierwszą intencję implementacyjną!
            </p>
          ) : (
            intentions.map((intention, index) => {
              const Icon = TRIGGER_ICONS[intention.trigger_type];
              return (
                <motion.div
                  key={intention.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    intention.active ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 text-sm">
                    <span className="text-muted-foreground">Gdy </span>
                    <span className="font-medium">{intention.trigger_value}</span>
                    <span className="text-muted-foreground">, zrobię </span>
                    <span className="font-medium">{intention.action}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggle(intention.id, !intention.active)}
                    >
                      {intention.active ? 'Aktywny' : 'Wstrzymany'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(intention.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}