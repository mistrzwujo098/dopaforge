'use client';

import { useEffect, ReactNode } from 'react';
import { usePopupManager, PopupPriority } from './popup-manager';
import { X } from 'lucide-react';

interface ManagedPopupProps {
  id: string;
  priority?: number;
  dismissible?: boolean;
  persistent?: boolean;
  cooldown?: number; // Minutes
  showCondition?: () => boolean;
  children: ReactNode;
  onClose?: () => void;
}

export function ManagedPopup({
  id,
  priority = PopupPriority.MEDIUM,
  dismissible = true,
  persistent = false,
  cooldown,
  showCondition,
  children,
  onClose,
}: ManagedPopupProps) {
  const { registerPopup, unregisterPopup, dismissPopup, getCurrentPopup } = usePopupManager();

  useEffect(() => {
    const PopupWrapper = () => (
      <div className="relative">
        {children}
        {dismissible && (
          <button
            onClick={() => {
              dismissPopup(id);
              onClose?.();
            }}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    registerPopup({
      id,
      priority,
      component: <PopupWrapper />,
      dismissible,
      persistent,
      cooldown,
      showCondition,
    });

    return () => {
      unregisterPopup(id);
    };
  }, [id, priority, dismissible, persistent, cooldown, showCondition, children, registerPopup, unregisterPopup, dismissPopup, onClose]);

  // Component doesn't render anything itself - rendering is handled by PopupManager
  return null;
}