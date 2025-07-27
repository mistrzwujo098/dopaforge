// path: apps/web/src/components/__tests__/task-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from '../task-card';

const mockTask = {
  id: '1',
  user_id: 'user-1',
  title: 'Test Task',
  est_minutes: 30,
  status: 'pending' as const,
  started_at: null,
  completed_at: null,
  created_at: new Date().toISOString(),
  display_order: 0,
};

describe('TaskCard', () => {
  it('renders task information', () => {
    render(
      <TaskCard
        task={mockTask}
        onStart={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
  });

  it('calls onStart when play button is clicked', () => {
    const onStart = vi.fn();
    render(
      <TaskCard
        task={mockTask}
        onStart={onStart}
        onComplete={vi.fn()}
      />
    );

    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);

    expect(onStart).toHaveBeenCalledWith('1');
  });

  it('shows completed state correctly', () => {
    const completedTask = { ...mockTask, status: 'completed' as const };
    render(
      <TaskCard
        task={completedTask}
        onStart={vi.fn()}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Test Task')).toHaveClass('line-through');
  });
});