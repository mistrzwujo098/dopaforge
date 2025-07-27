import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTaskDialog } from '../create-task-dialog';

// Mock portal for Radix UI components
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('CreateTaskDialog', () => {
  const mockOnCreateTask = vi.fn().mockResolvedValue(undefined);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the button trigger', () => {
    render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    expect(screen.getByRole('button', { name: /nowe mikro zadanie/i })).toBeInTheDocument();
  });

  it('should open dialog when button is clicked', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    const button = screen.getByRole('button', { name: /nowe mikro zadanie/i });
    await user.click(button);
    
    // Wait for dialog to appear in portal
    await waitFor(() => {
      const dialog = within(baseElement).getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
    
    expect(within(baseElement).getByText('Utwórz Mikro Zadanie')).toBeInTheDocument();
  });

  it('should close dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    // Open dialog
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    // Wait for dialog to appear
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click cancel
    const cancelButton = within(baseElement).getByRole('button', { name: /anuluj/i });
    await user.click(cancelButton);
    
    // Dialog should be closed
    await waitFor(() => {
      expect(within(baseElement).queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    // Open dialog
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    // Wait for dialog to appear
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    // Try to submit without filling fields
    const submitButton = within(baseElement).getByRole('button', { name: /utwórz zadanie/i });
    
    // Should be disabled when title is empty
    expect(submitButton).toBeDisabled();
    
    // Should not call onCreateTask
    expect(mockOnCreateTask).not.toHaveBeenCalled();
  });

  it('should call onCreateTask with valid data', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    // Open dialog
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    // Wait for dialog to appear
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    // Fill in the form
    const titleInput = within(baseElement).getByPlaceholderText(/np. Napisz wstęp/i);
    await user.type(titleInput, 'Test task');
    
    // Submit
    await user.click(within(baseElement).getByRole('button', { name: /utwórz zadanie/i }));
    
    // Should call onCreateTask with default time of 30
    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith('Test task', 30);
    });
    
    // Dialog should close
    await waitFor(() => {
      expect(within(baseElement).queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it.skip('should reset form when reopened', async () => {
    // Skipped due to Radix UI portal/act warnings in test environment
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    // Open dialog and fill form
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    const titleInput = within(baseElement).getByPlaceholderText(/np. Napisz wstęp/i);
    await user.type(titleInput, 'Test task');
    
    // Cancel
    await user.click(within(baseElement).getByRole('button', { name: /anuluj/i }));
    
    // Wait for dialog to close
    await waitFor(() => {
      expect(within(baseElement).queryByRole('dialog')).not.toBeInTheDocument();
    });
    
    // Reopen
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    // Form should be reset
    expect(within(baseElement).getByPlaceholderText(/np. Napisz wstęp/i)).toHaveValue('');
    expect(within(baseElement).getByText('30 min')).toBeInTheDocument();
  });

  it.skip('should have correct slider attributes', async () => {
    // Skipped due to Radix UI slider role assignment in test environment
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    // Open dialog
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    // Check that slider enforces limits (15-90 minutes)
    // Radix UI puts the slider role on the thumb element
    const slider = within(baseElement).getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuemin', '15');
    expect(slider).toHaveAttribute('aria-valuemax', '90');
    expect(slider).toHaveAttribute('aria-valuenow', '30');
  });

  it('should show AI breakdown button', async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<CreateTaskDialog onCreateTask={mockOnCreateTask} />);
    
    // Open dialog
    await user.click(screen.getByRole('button', { name: /nowe mikro zadanie/i }));
    
    await waitFor(() => {
      expect(within(baseElement).getByRole('dialog')).toBeInTheDocument();
    });
    
    // Fill in title to enable AI button
    const titleInput = within(baseElement).getByPlaceholderText(/np. Napisz wstęp/i);
    await user.type(titleInput, 'Complex task to break down');
    
    // Check AI button exists and is enabled
    const aiButton = within(baseElement).getByRole('button', { name: /podział ai/i });
    expect(aiButton).toBeInTheDocument();
    expect(aiButton).toBeEnabled();
  });
});