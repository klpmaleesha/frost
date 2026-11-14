'use client';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from 'radix-ui';
import { LoaderCircle } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  asChild?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', loading = false, asChild, className = '', children, disabled, ...props }, ref) {
  const Component = asChild ? Slot.Root : 'button';
  return <Component ref={ref} type="button" className={`av-button av-button--${variant} av-button--${size} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{asChild ? children : <>{loading && <LoaderCircle size={16} className="av-spin" aria-hidden="true"/>}{children}</>}</Component>;
});
