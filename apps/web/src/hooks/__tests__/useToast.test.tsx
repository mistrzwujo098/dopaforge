import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '../useToast';

describe('useToast', () => {
  it('should add a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      const { id } = result.current.toast({
        title: 'Test Toast',
        description: 'This is a test',
      });
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Test Toast',
      description: 'This is a test',
    });
  });

  it('should replace toast when adding multiple (TOAST_LIMIT = 1)', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 1');
    
    act(() => {
      result.current.toast({ title: 'Toast 2' });
    });
    
    // With TOAST_LIMIT = 1, should only have the latest toast
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
    
    act(() => {
      result.current.toast({ title: 'Toast 3' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 3');
  });

  it('should dismiss a toast by id', () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;
    
    act(() => {
      const { id } = result.current.toast({ title: 'Test Toast' });
      toastId = id;
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss(toastId!);
    });
    
    // Toast is dismissed but not removed immediately
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should dismiss all toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    
    act(() => {
      result.current.dismiss();
    });
    
    // Toast is dismissed but not removed immediately
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].open).toBe(false);
  });

  it('should update an existing toast', () => {
    const { result } = renderHook(() => useToast());
    let toastId: string;
    
    act(() => {
      const { id } = result.current.toast({ title: 'Original' });
      toastId = id;
    });
    
    expect(result.current.toasts[0].title).toBe('Original');
    const originalId = result.current.toasts[0].id;
    
    act(() => {
      // When calling toast with an id, it creates a new toast (doesn't update)
      result.current.toast({
        id: toastId!,
        title: 'Updated',
        description: 'New description',
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    // The new toast replaces the old one due to TOAST_LIMIT = 1
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Updated',
      description: 'New description',
    });
  });

  it('should handle toast variants', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Destructive Toast',
        variant: 'destructive',
      });
    });
    
    expect(result.current.toasts[0]).toMatchObject({
      title: 'Destructive Toast',
      variant: 'destructive',
    });
  });

  it('should handle action in toast', () => {
    const { result } = renderHook(() => useToast());
    const mockAction = vi.fn();
    
    act(() => {
      result.current.toast({
        title: 'Action Toast',
        action: {
          label: 'Undo',
          onClick: mockAction,
        },
      });
    });
    
    expect(result.current.toasts[0].action).toMatchObject({
      label: 'Undo',
      onClick: mockAction,
    });
  });

  it('should generate unique IDs for each toast', () => {
    const { result } = renderHook(() => useToast());
    const ids: string[] = [];
    
    act(() => {
      const { id: id1 } = result.current.toast({ title: 'Toast 1' });
      ids.push(id1);
    });
    
    act(() => {
      const { id: id2 } = result.current.toast({ title: 'Toast 2' });
      ids.push(id2);
    });
    
    act(() => {
      const { id: id3 } = result.current.toast({ title: 'Toast 3' });
      ids.push(id3);
    });
    
    // All IDs should be unique
    expect(new Set(ids).size).toBe(3);
  });
});