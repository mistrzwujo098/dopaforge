'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { t } from '@/lib/i18n';
import { slideDown } from '@/lib/animations';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowIndicator(true);
      } else if (showIndicator) {
        // Show "back online" message briefly
        setTimeout(() => setShowIndicator(false), 3000);
      }
    };

    // Check initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showIndicator]);

  return (
    <AnimatePresence>
      {showIndicator && (
        <motion.div
          {...slideDown}
          className={`fixed top-0 left-0 right-0 z-50 ${
            isOnline ? 'bg-green-500' : 'bg-orange-500'
          }`}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Połączenie przywrócone</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>{t('pwa.offlineMode')} - zmiany zostaną zsynchronizowane</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}