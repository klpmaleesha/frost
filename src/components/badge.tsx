import type { HTMLAttributes } from 'react';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { tone?: 'neutral' | 'success' | 'warning' | 'info'; dot?: boolean }
export function Badge({ tone = 'neutral', dot, className = '', children, ...props }: BadgeProps) { return <span className={`av-badge av-badge--${tone} ${className}`} {...props}>{dot && <span className="av-badge-dot" aria-hidden="true"/>}{children}</span>; }
