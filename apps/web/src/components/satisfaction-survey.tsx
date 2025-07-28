'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
} from '@dopaforge/ui';
import { Star, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import { slideUp, popIn } from '@/lib/animations';

interface SatisfactionSurveyProps {
  onSubmit?: (rating: number, feedback?: string) => void;
}

export function SatisfactionSurvey({ onSubmit }: SatisfactionSurveyProps) {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    // Check if should show survey
    const lastSurvey = localStorage.getItem('last_satisfaction_survey');
    const tasksCompleted = parseInt(localStorage.getItem('tasks_completed') || '0');
    const daysSinceLastSurvey = lastSurvey 
      ? (Date.now() - parseInt(lastSurvey)) / (1000 * 60 * 60 * 24)
      : Infinity;

    // Show survey after 20 tasks or 7 days
    if (tasksCompleted >= 20 && daysSinceLastSurvey > 7) {
      setTimeout(() => setShow(true), 5000);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (rating === 0) return;

    try {
      // Send to API
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          userEmail: user?.email,
          type: 'satisfaction',
          message: `Rating: ${rating}/5${feedback ? `. Feedback: ${feedback}` : ''}`,
          metadata: {
            rating,
            timestamp: new Date().toISOString(),
          },
        }),
      });

      setSubmitted(true);
      localStorage.setItem('last_satisfaction_survey', Date.now().toString());
      
      if (onSubmit) {
        onSubmit(rating, feedback);
      }

      toast({
        title: 'Dziękujemy za opinię!',
        description: rating >= 4 
          ? 'Cieszymy się, że lubisz DopaForge!' 
          : 'Pracujemy nad ulepszeniami!',
      });

      setTimeout(() => {
        setShow(false);
        // Reset after animation
        setTimeout(() => {
          setSubmitted(false);
          setRating(0);
          setFeedback('');
        }, 300);
      }, 2000);
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('last_satisfaction_survey', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          {...slideUp}
          className="fixed bottom-4 right-4 z-40 max-w-sm"
        >
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Jak oceniasz DopaForge?</CardTitle>
                  <CardDescription>
                    Twoja opinia pomoże nam się rozwijać
                  </CardDescription>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="form" {...popIn} className="space-y-4">
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="p-1"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= (hoveredRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </motion.button>
                      ))}
                    </div>
                    
                    {rating > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <Textarea
                          placeholder={
                            rating >= 4
                              ? 'Co najbardziej Ci się podoba?'
                              : 'Co możemy poprawić?'
                          }
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={handleSubmit}
                            className="flex-1"
                          >
                            Wyślij opinię
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDismiss}
                          >
                            Może później
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="thanks"
                    {...popIn}
                    className="text-center py-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      className="text-4xl mb-2"
                    >
                      {rating >= 4 ? '😊' : '🤔'}
                    </motion.div>
                    <p className="font-medium">Dziękujemy!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}