'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, CardContent } from '@dopaforge/ui';
import { Download, X, Smartphone } from 'lucide-react';
import { t } from '@/lib/i18n';
import { slideUp } from '@/lib/animations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available
                  if (confirm(t('pwa.updateAvailable'))) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 30 seconds or 3 page views
      const installPromptShown = localStorage.getItem('pwa_install_prompt_shown');
      const pageViews = parseInt(localStorage.getItem('page_views') || '0');
      
      if (!installPromptShown && pageViews >= 3) {
        setTimeout(() => setShowInstallPrompt(true), 30000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track page views
    const pageViews = parseInt(localStorage.getItem('page_views') || '0');
    localStorage.setItem('page_views', (pageViews + 1).toString());

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_install_prompt_shown', 'true');
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_install_prompt_shown', 'true');
  };

  return (
    <>
      {children}
      
      <AnimatePresence>
        {showInstallPrompt && !isInstalled && (
          <motion.div
            {...slideUp}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <Card className="shadow-lg border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{t('pwa.installPrompt')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('pwa.offlineDesc')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={handleInstall}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t('pwa.installButton')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDismiss}
                      >
                        {t('pwa.laterButton')}
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}