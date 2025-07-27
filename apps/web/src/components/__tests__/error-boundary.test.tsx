import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ErrorBoundary } from '../error-boundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch errors and display error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ups! Coś poszło nie tak')).toBeInTheDocument();
    expect(screen.getByText(/Przepraszamy, wystąpił nieoczekiwany błąd/)).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Szczegóły błędu (tylko w trybie deweloperskim)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Szczegóły błędu (tylko w trybie deweloperskim)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should render custom fallback when provided', () => {
    const CustomFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Ups! Coś poszło nie tak')).not.toBeInTheDocument();
  });

  it('should reset error state when "Try again" is clicked', async () => {
    const user = userEvent.setup();

    // Component that can be controlled
    function ControlledError() {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
          <button onClick={() => setShouldThrow(false)} style={{ display: 'none' }}>
            Fix Error
          </button>
        </ErrorBoundary>
      );
    }

    render(<ControlledError />);

    // Verify error UI is shown
    expect(screen.getByText('Ups! Coś poszło nie tak')).toBeInTheDocument();

    // Click "Try again" - this should reset the error boundary
    await user.click(screen.getByText('Spróbuj ponownie'));

    // After reset, the component should render its children again
    // Since shouldThrow is still true, it will throw again and show error UI
    expect(screen.getByText('Ups! Coś poszło nie tak')).toBeInTheDocument();
  });

  it('should have a link to home page', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeLink = screen.getByRole('link', { name: /Strona główna/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should log errors in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error caught by boundary:',
      expect.any(Error),
      expect.any(Object)
    );

    process.env.NODE_ENV = originalEnv;
  });
});