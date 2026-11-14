'use client';
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; hint?: string; error?: string; leading?: ReactNode }
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({label, hint, error, leading, className = '', id, ...props}, ref) {
  const generated = useId(); const inputId = id || generated; const messageId = `${inputId}-message`;
  return <div className={`av-field ${className}`}>{label && <label htmlFor={inputId} className="av-label">{label}</label>}<div className="av-input-wrap">{leading && <span className="av-input-icon" aria-hidden="true">{leading}</span>}<input ref={ref} id={inputId} className={`av-input ${leading ? 'av-input--icon' : ''}`} aria-invalid={!!error || undefined} aria-describedby={(error || hint) ? messageId : undefined} {...props}/></div>{(error || hint) && <p id={messageId} className={`av-hint ${error ? 'av-error' : ''}`}>{error || hint}</p>}</div>;
});
