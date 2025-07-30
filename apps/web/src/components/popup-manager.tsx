'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Popup {
  id: string;
  priority: number; // Lower number = higher priority
  component: ReactNode;
  dismissible: boolean;
  persistent?: boolean; // Should it reappear?
  cooldown?: number; // Minutes before showing again
  showCondition?: () => boolean;
}

interface PopupManagerContextType {
  registerPopup: (popup: Popup) => void;
  unregisterPopup: (id: string) => void;
  dismissPopup: (id: string) => void;
  getCurrentPopup: () => Popup | null;
}

const PopupManagerContext = createContext<PopupManagerContextType | null>(null);

export function usePopupManager() {
  const context = useContext(PopupManagerContext);
  if (!context) {
    throw new Error('usePopupManager must be used within PopupManagerProvider');
  }
  return context;
}

export function PopupManagerProvider({ children }: { children: ReactNode }) {
  const [popups, setPopups] = useState<Popup[]>([]);
  const [dismissedPopups, setDismissedPopups] = useState<Record<string, number>>({});
  const [currentPopupId, setCurrentPopupId] = useState<string | null>(null);

  // Load dismissed popups from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dismissedPopups');
    if (stored) {
      setDismissedPopups(JSON.parse(stored));
    }
  }, []);

  // Save dismissed popups to localStorage
  useEffect(() => {
    localStorage.setItem('dismissedPopups', JSON.stringify(dismissedPopups));
  }, [dismissedPopups]);

  const registerPopup = (popup: Popup) => {
    setPopups(prev => {
      // Check if popup is already registered
      if (prev.some(p => p.id === popup.id)) {
        return prev;
      }
      
      // Check if popup should be shown based on cooldown
      const lastDismissed = dismissedPopups[popup.id];
      if (lastDismissed && popup.cooldown) {
        const cooldownMs = popup.cooldown * 60 * 1000;
        if (Date.now() - lastDismissed < cooldownMs) {
          return prev; // Still in cooldown
        }
      }
      
      // Check show condition
      if (popup.showCondition && !popup.showCondition()) {
        return prev;
      }
      
      // Add popup sorted by priority
      const newPopups = [...prev, popup].sort((a, b) => a.priority - b.priority);
      return newPopups;
    });
  };

  const unregisterPopup = (id: string) => {
    setPopups(prev => prev.filter(p => p.id !== id));
    if (currentPopupId === id) {
      setCurrentPopupId(null);
    }
  };

  const dismissPopup = (id: string) => {
    const popup = popups.find(p => p.id === id);
    if (popup && !popup.persistent) {
      setDismissedPopups(prev => ({
        ...prev,
        [id]: Date.now()
      }));
    }
    
    setPopups(prev => prev.filter(p => p.id !== id));
    if (currentPopupId === id) {
      setCurrentPopupId(null);
    }
  };

  const getCurrentPopup = () => {
    // Return the highest priority popup
    return popups[0] || null;
  };

  // Update current popup when popups change
  useEffect(() => {
    const current = getCurrentPopup();
    setCurrentPopupId(current?.id || null);
  }, [popups]);

  return (
    <PopupManagerContext.Provider
      value={{
        registerPopup,
        unregisterPopup,
        dismissPopup,
        getCurrentPopup,
      }}
    >
      {children}
      {/* Render current popup */}
      {popups.length > 0 && popups[0] && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="pointer-events-auto">
            {popups[0].component}
          </div>
        </div>
      )}
    </PopupManagerContext.Provider>
  );
}

// Popup priorities enum for consistency
export const PopupPriority = {
  CRITICAL: 1,      // Errors, critical alerts
  HIGH: 10,         // Onboarding, important features
  MEDIUM: 20,       // Feature discovery, tips
  LOW: 30,          // Notifications, surveys
  BACKGROUND: 40,   // Background hints, idle warnings
} as const;