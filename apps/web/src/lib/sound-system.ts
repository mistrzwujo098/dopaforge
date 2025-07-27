'use client';

export class SoundSystem {
  private static instance: SoundSystem;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.5;
  private ambientAudio?: HTMLAudioElement;

  private constructor() {
    // Check user preference
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
    
    // Preload sounds
    this.preloadSounds();
  }

  static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  private preloadSounds() {
    const soundFiles = {
      // Success sounds
      taskComplete: '/sounds/task-complete.mp3',
      levelUp: '/sounds/level-up.mp3',
      achievement: '/sounds/achievement.mp3',
      combo: '/sounds/combo.mp3',
      
      // Failure/Warning sounds
      warning: '/sounds/warning.mp3',
      failure: '/sounds/failure.mp3',
      comboBreak: '/sounds/combo-break.mp3',
      
      // UI sounds
      click: '/sounds/click.mp3',
      hover: '/sounds/hover.mp3',
      notification: '/sounds/notification.mp3',
      
      // Ambient
      ambient: '/sounds/ambient-focus.mp3',
      
      // Gamification
      coinCollect: '/sounds/coin.mp3',
      powerUp: '/sounds/power-up.mp3',
      unlock: '/sounds/unlock.mp3',
    };

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.sounds.set(key, audio);
    });
  }

  play(soundName: string) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = this.volume;
      sound.play().catch(() => {});
    }
  }

  playSequence(soundNames: string[], delays: number[]) {
    if (!this.enabled) return;
    
    soundNames.forEach((soundName, index) => {
      setTimeout(() => this.play(soundName), delays[index] || 0);
    });
  }

  startAmbient() {
    if (!this.enabled) return;
    
    const ambient = this.sounds.get('ambient');
    if (ambient && !this.ambientAudio) {
      this.ambientAudio = ambient;
      this.ambientAudio.loop = true;
      this.ambientAudio.volume = this.volume * 0.3; // Quieter ambient
      this.ambientAudio.play().catch(() => {});
    }
  }

  stopAmbient() {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
      this.ambientAudio = undefined;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
    
    if (!enabled) {
      this.stopAmbient();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume.toString());
    
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
    
    if (this.ambientAudio) {
      this.ambientAudio.volume = this.volume * 0.3;
    }
  }

  // Special effect combos
  playSuccess() {
    this.play('taskComplete');
    // Add a subtle coin sound after 200ms
    setTimeout(() => this.play('coinCollect'), 200);
  }

  playLevelUp() {
    this.playSequence(['powerUp', 'levelUp', 'achievement'], [0, 300, 800]);
  }

  playCombo(comboCount: number) {
    const pitch = Math.min(1.5, 1 + (comboCount * 0.1));
    const combo = this.sounds.get('combo');
    if (combo && this.enabled) {
      combo.playbackRate = pitch;
      combo.play();
    }
  }

  playWarning() {
    this.play('warning');
    // Vibrate if available
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }
}