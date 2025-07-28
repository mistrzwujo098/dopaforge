'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@dopaforge/ui';
import { SoundSystem } from '@/lib/sound-system';
import { useUser } from '@/hooks/useUser';
import { getUserProfile, updateUserProfile } from '@/lib/db-client';

export function SoundControl() {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundSystem = SoundSystem.getInstance();
  const { user } = useUser();

  useEffect(() => {
    const loadSoundSettings = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile) {
            setEnabled((profile as any).sound_enabled !== false);
            setVolume((profile as any).sound_volume || 0.5);
            soundSystem.setEnabled((profile as any).sound_enabled !== false);
            soundSystem.setVolume((profile as any).sound_volume || 0.5);
            return;
          }
        } catch (error) {
          console.error('Failed to load sound settings from database:', error);
        }
      }
      
      // Fallback na localStorage
      const savedEnabled = localStorage.getItem('soundEnabled') !== 'false';
      const savedVolume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
      setEnabled(savedEnabled);
      setVolume(savedVolume);
    };
    
    loadSoundSettings();
  }, [user]);

  const toggleSound = async () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    soundSystem.setEnabled(newEnabled);
    soundSystem.play('click');
    
    // Zapisz do bazy danych
    if (user) {
      try {
        await updateUserProfile(user.id, { sound_enabled: newEnabled } as any);
      } catch (error) {
        console.error('Failed to save sound setting to database:', error);
      }
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundSystem.setVolume(newVolume);
    
    // Zapisz do bazy danych z debounce
    if (user) {
      try {
        await updateUserProfile(user.id, { sound_volume: newVolume } as any);
      } catch (error) {
        console.error('Failed to save volume setting to database:', error);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSound}
        className="p-2"
      >
        {enabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
      
      {enabled && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      )}
    </div>
  );
}