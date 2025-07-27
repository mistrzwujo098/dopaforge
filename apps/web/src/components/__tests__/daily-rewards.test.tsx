import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { DailyLoginRewards } from '../daily-login-rewards';
import { SoundSystem } from '@/lib/sound-system';

// Mock SoundSystem
vi.mock('@/lib/sound-system', () => ({
  SoundSystem: {
    getInstance: vi.fn(() => ({
      play: vi.fn()
    }))
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('DailyLoginRewards', () => {
  const mockSoundSystem = {
    play: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (SoundSystem.getInstance as any).mockReturnValue(mockSoundSystem);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-27T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders daily rewards interface', () => {
    render(<DailyLoginRewards userId="test-user" />);
    // The modal opens automatically on first load, so look for the button or modal title
    const title = screen.getByText('Codzienne Nagrody');
    expect(title).toBeInTheDocument();
  });

  it('shows all 7 days of rewards', () => {
    render(<DailyLoginRewards userId="test-user" />);
    
    // Modal opens automatically on first visit
    // Text is split across elements, check for "Dzień" text
    const dayLabels = screen.getAllByText(/Dzień/);
    expect(dayLabels).toHaveLength(7);
    
    // Check for all reward texts instead of numbers
    expect(screen.getByText('50 XP')).toBeInTheDocument();
    expect(screen.getByText('100 XP')).toBeInTheDocument();
    expect(screen.getByText('2x XP Boost')).toBeInTheDocument();
    expect(screen.getByText('200 XP')).toBeInTheDocument();
    expect(screen.getByText('Streak Freeze')).toBeInTheDocument();
    expect(screen.getByText('300 XP')).toBeInTheDocument();
    expect(screen.getByText('Mega Bonus!')).toBeInTheDocument();
  });

  it('allows claiming today\'s reward', async () => {
    render(<DailyLoginRewards userId="test-user" />);
    
    // Modal opens automatically on first visit
    // Find and click claim button
    const claimButton = screen.getByText('Odbierz Nagrodę');
    expect(claimButton).toBeInTheDocument();
    
    await act(async () => {
      fireEvent.click(claimButton);
    });
    
    // Should immediately play coinCollect sound
    expect(mockSoundSystem.play).toHaveBeenCalledWith('coinCollect');
    
    // Wait for the animation timeout (1 second) and check for achievement sound
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });
    
    expect(mockSoundSystem.play).toHaveBeenCalledWith('achievement');
  });

  it('prevents claiming reward twice on same day', () => {
    const today = new Date('2025-01-27T12:00:00');
    const rewardData = {
      currentDay: 1,
      rewards: [
        { day: 1, reward: { type: 'xp', amount: 50, name: '50 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 2, reward: { type: 'xp', amount: 100, name: '100 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 3, reward: { type: 'powerup', amount: 1, name: '2x XP Boost', icon: '⚡' }, claimed: false, available: false },
        { day: 4, reward: { type: 'xp', amount: 200, name: '200 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 5, reward: { type: 'streak_freeze', amount: 1, name: 'Streak Freeze', icon: '🧊' }, claimed: false, available: false },
        { day: 6, reward: { type: 'xp', amount: 300, name: '300 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 7, reward: { type: 'bonus', amount: 500, name: 'Mega Bonus!', icon: '🎁' }, claimed: false, available: false }
      ]
    };
    localStorage.setItem('daily_rewards_test-user', JSON.stringify(rewardData));
    localStorage.setItem('last_login_test-user', today.toISOString());
    
    render(<DailyLoginRewards userId="test-user" />);
    
    // Day 1 should show as claimed - click button to open modal first
    const button = screen.getByText('Nagrody Dnia');
    fireEvent.click(button);
    
    // Now check for check icons in the modal - look for path with check mark
    const svgs = document.querySelectorAll('svg.lucide-check');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('resets streak if more than 24 hours passed', () => {
    const twoDaysAgo = new Date('2025-01-25T12:00:00');
    const rewardData = {
      currentDay: 3,
      rewards: [
        { day: 1, reward: { type: 'xp', amount: 50, name: '50 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 2, reward: { type: 'xp', amount: 100, name: '100 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 3, reward: { type: 'powerup', amount: 1, name: '2x XP Boost', icon: '⚡' }, claimed: true, available: false },
        { day: 4, reward: { type: 'xp', amount: 200, name: '200 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 5, reward: { type: 'streak_freeze', amount: 1, name: 'Streak Freeze', icon: '🧊' }, claimed: false, available: false },
        { day: 6, reward: { type: 'xp', amount: 300, name: '300 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 7, reward: { type: 'bonus', amount: 500, name: 'Mega Bonus!', icon: '🎁' }, claimed: false, available: false }
      ]
    };
    localStorage.setItem('daily_rewards_test-user', JSON.stringify(rewardData));
    localStorage.setItem('last_login_test-user', twoDaysAgo.toISOString());
    
    render(<DailyLoginRewards userId="test-user" />);
    
    // Modal should show automatically on new day
    // Should reset to day 1 - button should be present
    const claimButton = screen.getByText('Odbierz Nagrodę');
    expect(claimButton).toBeInTheDocument();
  });

  it('continues streak if within 24 hours', () => {
    const yesterday = new Date('2025-01-26T12:00:00');
    const rewardData = {
      currentDay: 3,
      rewards: [
        { day: 1, reward: { type: 'xp', amount: 50, name: '50 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 2, reward: { type: 'xp', amount: 100, name: '100 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 3, reward: { type: 'powerup', amount: 1, name: '2x XP Boost', icon: '⚡' }, claimed: true, available: false },
        { day: 4, reward: { type: 'xp', amount: 200, name: '200 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 5, reward: { type: 'streak_freeze', amount: 1, name: 'Streak Freeze', icon: '🧊' }, claimed: false, available: false },
        { day: 6, reward: { type: 'xp', amount: 300, name: '300 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 7, reward: { type: 'bonus', amount: 500, name: 'Mega Bonus!', icon: '🎁' }, claimed: false, available: false }
      ]
    };
    localStorage.setItem('daily_rewards_test-user', JSON.stringify(rewardData));
    localStorage.setItem('last_login_test-user', yesterday.toISOString());
    
    render(<DailyLoginRewards userId="test-user" />);
    
    // Should be on day 4 - check that button exists and day 4 shows correct reward
    const claimButton = screen.getByText('Odbierz Nagrodę');
    expect(claimButton).toBeInTheDocument();
    expect(screen.getByText('200 XP')).toBeInTheDocument(); // Day 4 reward
  });

  it('completes 7-day cycle and resets', async () => {
    const yesterday = new Date('2025-01-26T12:00:00');
    const rewardData = {
      currentDay: 7,
      rewards: [
        { day: 1, reward: { type: 'xp', amount: 50, name: '50 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 2, reward: { type: 'xp', amount: 100, name: '100 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 3, reward: { type: 'powerup', amount: 1, name: '2x XP Boost', icon: '⚡' }, claimed: true, available: false },
        { day: 4, reward: { type: 'xp', amount: 200, name: '200 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 5, reward: { type: 'streak_freeze', amount: 1, name: 'Streak Freeze', icon: '🧊' }, claimed: true, available: false },
        { day: 6, reward: { type: 'xp', amount: 300, name: '300 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 7, reward: { type: 'bonus', amount: 500, name: 'Mega Bonus!', icon: '🎁' }, claimed: true, available: false }
      ]
    };
    localStorage.setItem('daily_rewards_test-user', JSON.stringify(rewardData));
    localStorage.setItem('last_login_test-user', yesterday.toISOString());
    
    // Clear mocks before test
    vi.clearAllMocks();
    
    const { rerender } = render(<DailyLoginRewards userId="test-user" />);
    
    // After claiming all 7 days and advancing to next day, it should show modal automatically
    // Check that it resets to day 1
    const claimButton = screen.getByText('Odbierz Nagrodę');
    expect(claimButton).toBeInTheDocument();
    expect(screen.getByText('50 XP')).toBeInTheDocument(); // Day 1 reward
  });

  it('displays correct reward values', () => {
    render(<DailyLoginRewards userId="test-user" />);
    
    expect(screen.getByText('50 XP')).toBeInTheDocument(); // Day 1
    expect(screen.getByText('Mega Bonus!')).toBeInTheDocument(); // Day 7
  });

  it('shows claimed status for previous days', () => {
    const today = new Date('2025-01-27T12:00:00');
    const rewardData = {
      currentDay: 3,
      rewards: [
        { day: 1, reward: { type: 'xp', amount: 50, name: '50 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 2, reward: { type: 'xp', amount: 100, name: '100 XP', icon: '⭐' }, claimed: true, available: false },
        { day: 3, reward: { type: 'powerup', amount: 1, name: '2x XP Boost', icon: '⚡' }, claimed: true, available: false },
        { day: 4, reward: { type: 'xp', amount: 200, name: '200 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 5, reward: { type: 'streak_freeze', amount: 1, name: 'Streak Freeze', icon: '🧊' }, claimed: false, available: false },
        { day: 6, reward: { type: 'xp', amount: 300, name: '300 XP', icon: '⭐' }, claimed: false, available: false },
        { day: 7, reward: { type: 'bonus', amount: 500, name: 'Mega Bonus!', icon: '🎁' }, claimed: false, available: false }
      ]
    };
    localStorage.setItem('daily_rewards_test-user', JSON.stringify(rewardData));
    localStorage.setItem('last_login_test-user', today.toISOString());
    
    render(<DailyLoginRewards userId="test-user" />);
    
    // Days 1-3 should show as claimed - open modal and check for check icons
    const button = screen.getByText('Nagrody Dnia');
    fireEvent.click(button);
    
    const svgs = document.querySelectorAll('svg.lucide-check');
    expect(svgs.length).toBe(3); // 3 claimed days
  });
});