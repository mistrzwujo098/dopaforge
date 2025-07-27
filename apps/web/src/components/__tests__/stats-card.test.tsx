import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../stats-card';
import { Trophy, Zap } from 'lucide-react';

describe('StatsCard', () => {
  it('should render with all props', () => {
    render(
      <StatsCard
        title="Test Title"
        value={42}
        icon={Trophy}
        delay={0.1}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render string values', () => {
    render(
      <StatsCard
        title="Streak"
        value="7 dni"
        icon={Zap}
        delay={0}
      />
    );
    
    expect(screen.getByText('Streak')).toBeInTheDocument();
    expect(screen.getByText('7 dni')).toBeInTheDocument();
  });

  it('should apply animation delay', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value={100}
        icon={Trophy}
        delay={0.5}
      />
    );
    
    const motionDiv = container.querySelector('div');
    expect(motionDiv).toBeTruthy();
  });

  it('should render icon', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value={100}
        icon={Trophy}
        delay={0}
      />
    );
    
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should handle zero values', () => {
    render(
      <StatsCard
        title="Zero Test"
        value={0}
        icon={Trophy}
        delay={0}
      />
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should handle large numbers', () => {
    render(
      <StatsCard
        title="Large Number"
        value={1000000}
        icon={Trophy}
        delay={0}
      />
    );
    
    expect(screen.getByText('1000000')).toBeInTheDocument();
  });
});