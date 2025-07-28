'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
  Label,
} from '@dopaforge/ui';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { t } from '@/lib/i18n';
import { popIn, successAnimation } from '@/lib/animations';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export function FeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>('improvement');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const handleSubmit = async () => {
    if (!message.trim() || !user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          type,
          message,
          metadata: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to send feedback');

      setSubmitted(true);
      
      setTimeout(() => {
        setOpen(false);
        // Reset form after closing
        setTimeout(() => {
          setSubmitted(false);
          setMessage('');
          setType('improvement');
        }, 300);
      }, 2000);
      
      toast({
        title: t('feedback.thanks'),
        description: 'Twoja opinia pomoże nam ulepszyć aplikację',
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: t('feedback.error'),
        description: 'Spróbuj ponownie później',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const feedbackTypes = [
    { value: 'bug', label: t('feedback.bug'), emoji: '🐛' },
    { value: 'feature', label: t('feedback.feature'), emoji: '✨' },
    { value: 'improvement', label: t('feedback.improvement'), emoji: '💡' },
    { value: 'other', label: t('feedback.other'), emoji: '💬' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          {t('feedback.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div key="form" {...popIn}>
              <DialogHeader>
                <DialogTitle>{t('feedback.title')}</DialogTitle>
                <DialogDescription>
                  {t('feedback.subtitle')}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Rodzaj opinii</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {feedbackTypes.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value as FeedbackType)}
                        className={`flex items-center justify-center gap-2 rounded-md border-2 p-3 transition-all ${
                          type === option.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-muted bg-popover hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <span className="text-lg">{option.emoji}</span>
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">{t('feedback.placeholder')}</Label>
                  <Textarea
                    id="message"
                    placeholder="Opisz swoją opinię, sugestię lub zgłoś problem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {message.length}/500 znaków
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!message.trim() || message.length > 500 || loading}
                  variant="gradient"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Send className="h-4 w-4" />
                      </motion.div>
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('feedback.send')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              {...successAnimation}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.5 }}
                className="bg-green-500 rounded-full p-4 mb-4"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{t('feedback.thanks')}</h3>
              <p className="text-muted-foreground text-center">
                Twoja opinia została wysłana
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}