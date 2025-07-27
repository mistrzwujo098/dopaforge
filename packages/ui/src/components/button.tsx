// path: packages/ui/src/components/button.tsx
'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md touch-manipulation active:scale-[0.98] keyboard-focus:ring-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground shadow-none',
        link: 'text-primary underline-offset-4 hover:underline shadow-none',
        gradient: 'bg-dopamine-gradient text-white hover:opacity-90',
      },
      size: {
        default: 'min-h-[48px] px-4 py-2',
        sm: 'min-h-[44px] rounded-xl px-3',
        lg: 'min-h-[52px] rounded-2xl px-8',
        icon: 'min-h-[48px] min-w-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Ensure proper ARIA attributes
    const ariaProps = {
      'aria-disabled': props.disabled || undefined,
      'aria-pressed': props['aria-pressed'],
      role: asChild ? undefined : 'button',
    };
    
    // Handle keyboard events for better accessibility
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Call original handler if exists
      props.onKeyDown?.(e as any);
      
      // Ensure Space and Enter activate the button
      if (!props.disabled && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        (e.target as HTMLButtonElement).click();
      }
    };
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onKeyDown={asChild ? props.onKeyDown : handleKeyDown}
        {...ariaProps}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };