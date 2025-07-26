// path: apps/web/src/components/self-compassion-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@dopaforge/ui';
import { Heart, Volume2, VolumeX } from 'lucide-react';

interface SelfCompassionModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
  triggerReason?: string;
}

const MEDITATION_SCRIPT = [
  "Take a deep breath and close your eyes if you'd like.",
  "Place your hand on your heart or somewhere comforting.",
  "Remember that setbacks are a natural part of being human.",
  "You are not alone in facing challenges.",
  "Speak to yourself as you would to a good friend.",
  "This moment is difficult, but it will pass.",
  "You are worthy of kindness, especially from yourself.",
  "Take another deep breath and when you're ready, open your eyes.",
];

export function SelfCompassionModal({
  open,
  onClose,
  onComplete,
  triggerReason,
}: SelfCompassionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setIsPlaying(false);
    }
  }, [open]);

  useEffect(() => {
    if (isPlaying && currentStep < MEDITATION_SCRIPT.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 4000); // 4 seconds per step

      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep === MEDITATION_SCRIPT.length - 1) {
      setTimeout(() => {
        setIsPlaying(false);
      }, 4000);
    }
  }, [currentStep, isPlaying]);

  const handleStart = () => {
    setIsPlaying(true);
    
    // Play audio if available
    if (!isMuted && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(MEDITATION_SCRIPT[currentStep]);
      utterance.rate = 0.8;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleComplete = async () => {
    await onComplete();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mx-auto mb-4"
          >
            <div className="relative">
              <Heart className="h-16 w-16 text-pink-500 fill-pink-500" />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Heart className="h-16 w-16 text-pink-500 opacity-30" />
              </motion.div>
            </div>
          </motion.div>
          <DialogTitle className="text-xl text-center">Self-Compassion Break</DialogTitle>
          <DialogDescription className="text-center">
            {triggerReason || "It's okay to struggle. Let's take a moment for self-kindness."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="min-h-[120px] flex items-center justify-center">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center text-lg leading-relaxed px-4"
            >
              {MEDITATION_SCRIPT[currentStep]}
            </motion.p>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {MEDITATION_SCRIPT.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep
                    ? 'bg-pink-500'
                    : index < currentStep
                    ? 'bg-pink-300'
                    : 'bg-gray-300'
                }`}
                animate={{
                  scale: index === currentStep ? 1.5 : 1,
                }}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Skip
            </Button>
            {!isPlaying ? (
              <Button onClick={handleStart} variant="gradient">
                Start Meditation
              </Button>
            ) : currentStep === MEDITATION_SCRIPT.length - 1 ? (
              <Button onClick={handleComplete} variant="gradient">
                Complete
              </Button>
            ) : (
              <Button disabled variant="gradient">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Heart className="h-4 w-4" />
                </motion.div>
                Breathing...
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}