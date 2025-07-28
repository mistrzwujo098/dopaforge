'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Dialog, DialogContent } from '@dopaforge/ui';
import { 
  Brain, 
  Zap, 
  Target, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { t } from '@/lib/i18n';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface OnboardingStep {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

const steps: OnboardingStep[] = [
  {
    icon: Target,
    title: t('onboarding.step1Title'),
    description: t('onboarding.step1Desc'),
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    icon: Zap,
    title: t('onboarding.step2Title'),
    description: t('onboarding.step2Desc'),
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    icon: Brain,
    title: t('onboarding.step3Title'),
    description: t('onboarding.step3Desc'),
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
  {
    icon: Sparkles,
    title: t('onboarding.step4Title'),
    description: t('onboarding.step4Desc'),
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
  },
];

export function OnboardingModal({ open, onClose, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              {t('onboarding.skip')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <div className="p-8 pt-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                {/* Welcome screen */}
                {currentStep === 0 && (
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                      {t('onboarding.welcome')}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      {t('onboarding.welcomeDesc')}
                    </p>
                  </div>
                )}

                {/* Step icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="inline-flex mb-6"
                >
                  <div className={`p-6 rounded-2xl ${step.bgColor}`}>
                    <step.icon className={`h-16 w-16 ${step.color}`} />
                  </div>
                </motion.div>

                {/* Step content */}
                <h2 className="text-2xl font-bold mb-4">{step.title}</h2>
                <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
                  {step.description}
                </p>

                {/* Visual element for each step */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto mb-8">
                    {[2, 5, 10, 15, 20, 25].map((minutes, idx) => (
                      <motion.div
                        key={minutes}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.3 }}
                        className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center"
                      >
                        <div className="text-2xl font-bold text-blue-600">{minutes}</div>
                        <div className="text-xs text-muted-foreground">min</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="flex justify-center gap-4 mb-8">
                    {['XP', 'Poziomy', 'Odznaki'].map((reward, idx) => (
                      <motion.div
                        key={reward}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 + 0.3, type: 'spring' }}
                        className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4"
                      >
                        <Zap className="h-8 w-8 text-yellow-600 mb-2" />
                        <div className="text-sm font-medium">{reward}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="relative max-w-xs mx-auto mb-8">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6"
                    >
                      <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-purple-600">21</div>
                      <div className="text-sm text-muted-foreground">dni do nawyku</div>
                    </motion.div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
                    {['Rytm', 'Pora dnia', 'Trudność', 'Nastrój'].map((item, idx) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 + 0.3 }}
                        className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4"
                      >
                        <Sparkles className="h-6 w-6 text-emerald-600 mb-2" />
                        <div className="text-sm font-medium">{item}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('common.back')}
              </Button>

              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`h-2 w-2 rounded-full ${
                      idx === currentStep
                        ? 'bg-primary'
                        : idx < currentStep
                        ? 'bg-primary/50'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    animate={{
                      scale: idx === currentStep ? 1.2 : 1,
                    }}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white border-0"
              >
                {currentStep === steps.length - 1 ? t('onboarding.getStarted') : t('common.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}