'use client';

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@dopaforge/ui';
import { SoundSystem } from '@/lib/sound-system';

export function SoundControl() {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const soundSystem = SoundSystem.getInstance();

  useEffect(() => {
    const savedEnabled = localStorage.getItem('soundEnabled') !== 'false';
    const savedVolume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
    setEnabled(savedEnabled);
    setVolume(savedVolume);
  }, []);

  const toggleSound = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    soundSystem.setEnabled(newEnabled);
    soundSystem.play('click');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundSystem.setVolume(newVolume);
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