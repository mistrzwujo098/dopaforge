import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../progress-bar';

describe('ProgressBar', () => {
  it('should render with label', () => {
    render(
      <ProgressBar
        value={50}
        max={100}
        label="Test Progress"
      />
    );
    
    expect(screen.getByText('Test Progress')).toBeInTheDocument();
  });

  it('should display value correctly', () => {
    render(
      <ProgressBar
        value={25}
        max={100}
        label="Progress"
      />
    );
    
    expect(screen.getByText('25 / 100')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(
      <ProgressBar
        value={0}
        max={100}
        label="No Progress"
      />
    );
    
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('should handle max value', () => {
    render(
      <ProgressBar
        value={100}
        max={100}
        label="Complete"
      />
    );
    
    expect(screen.getByText('100 / 100')).toBeInTheDocument();
  });

  it('should handle value greater than max', () => {
    render(
      <ProgressBar
        value={150}
        max={100}
        label="Overflow"
      />
    );
    
    expect(screen.getByText('150 / 100')).toBeInTheDocument();
  });

  it('should handle decimal values', () => {
    render(
      <ProgressBar
        value={33.33}
        max={100}
        label="Decimal"
      />
    );
    
    expect(screen.getByText('33.33 / 100')).toBeInTheDocument();
  });

  it('should handle zero max value', () => {
    render(
      <ProgressBar
        value={50}
        max={0}
        label="Zero Max"
      />
    );
    
    // Should show actual values
    expect(screen.getByText('50 / 0')).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(
      <ProgressBar
        value={75}
        max={100}
        label="Accessible Progress"
      />
    );
    
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '75');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    expect(progressbar).toHaveAttribute('aria-label', 'Accessible Progress');
  });

  it('should calculate progress correctly', () => {
    const { container } = render(
      <ProgressBar
        value={60}
        max={100}
        label="Width Test"
      />
    );
    
    // The Progress component uses transform for the inner fill
    // Find the inner div that has the actual progress fill
    const progressContainer = container.querySelector('[role="progressbar"]');
    const progressFill = progressContainer?.querySelector('[style*="translateX"]');
    expect(progressFill).toHaveStyle({ transform: 'translateX(-40%)' });
  });
});