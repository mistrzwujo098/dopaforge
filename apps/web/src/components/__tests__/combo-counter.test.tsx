import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ComboCounter } from '../combo-counter';
import { SoundSystem } from '@/lib/sound-system';

// Mock SoundSystem
vi.mock('@/lib/sound-system', () => ({
  SoundSystem: {
    getInstance: vi.fn(() => ({
      play: vi.fn(),
      playCombo: vi.fn(),
      playSuccess: vi.fn(),
      playLevelUp: vi.fn(),
      playWarning: vi.fn(),
      setVolume: vi.fn(),
      setEnabled: vi.fn(),
      preloadAll: vi.fn().mockResolvedValue(undefined)
    }))
  }
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('ComboCounter', () => {
  const mockSoundSystem = {
    play: vi.fn(),
    playCombo: vi.fn()
  };

  const mockOnComboBonus = vi.fn();

  const createMockTasks = (completed: number, spacing: number = 5) => {
    const now = Date.now();
    return Array(completed).fill(null).map((_, i) => ({
      id: `task-${i}`,
      status: i < completed ? 'completed' : 'pending',
      completed_at: i < completed ? new Date(now - i * spacing * 60 * 1000).toISOString() : undefined
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (SoundSystem.getInstance as any).mockReturnValue(mockSoundSystem);
  });

  it('renders with combo count based on tasks', () => {
    const tasks = createMockTasks(5);
    render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    expect(screen.getByText('5x')).toBeInTheDocument();
    expect(screen.getByText('Super Combo!')).toBeInTheDocument();
  });

  it('shows zero combo when no completed tasks', () => {
    const tasks = createMockTasks(0);
    const { container } = render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    // ComboCounter returns null when combo < 2
    expect(container.firstChild).toBeNull();
  });

  it('breaks combo when tasks are too far apart', () => {
    const tasks = createMockTasks(5, 40); // 40 minutes apart (> 30 min timeout)
    const { container } = render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    // ComboCounter returns null when combo < 2 (only 1 task within timeout)
    expect(container.firstChild).toBeNull();
  });

  it('calculates correct multiplier based on combo', () => {
    const tasks = createMockTasks(10);
    render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    
    // With 10 combo, multiplier should be 2.0
    expect(mockOnComboBonus).toHaveBeenCalledWith(2.0);
  });

  it('plays combo sound effects', () => {
    const tasks = createMockTasks(5);
    render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    expect(mockSoundSystem.playCombo).toHaveBeenCalledWith(5);
  });

  it('shows fire emoji for high combos', () => {
    const tasks = createMockTasks(10);
    const { container } = render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    // Fire emojis are rendered as floating elements
    const fireEmojis = container.querySelectorAll('span');
    const hasFireEmoji = Array.from(fireEmojis).some(el => el.textContent === '🔥');
    expect(hasFireEmoji).toBe(true);
  });

  it('displays time remaining for combo', () => {
    const tasks = createMockTasks(5);
    render(<ComboCounter tasks={tasks} onComboBonus={mockOnComboBonus} />);
    // Check for timer display - look for time format with colon
    const timerElements = screen.getAllByText(/:/);
    expect(timerElements.length).toBeGreaterThan(0);
  });

  it('updates combo when tasks prop changes', () => {
    const { rerender } = render(
      <ComboCounter tasks={createMockTasks(3)} onComboBonus={mockOnComboBonus} />
    );
    expect(screen.getByText('3x')).toBeInTheDocument();
    
    rerender(
      <ComboCounter tasks={createMockTasks(5)} onComboBonus={mockOnComboBonus} />
    );
    expect(screen.getByText('5x')).toBeInTheDocument();
  });
});