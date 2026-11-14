'use client';
import { useId, type ComponentProps } from 'react';
import { Switch as Primitive } from 'radix-ui';
export interface SwitchProps extends ComponentProps<typeof Primitive.Root> { label: string; description?: string }
export function Switch({label, description, id, className = '', ...props}: SwitchProps) { const generated = useId(); const switchId = id || generated; return <div className={`av-choice-row ${className}`}><div><label className="av-label" htmlFor={switchId}>{label}</label>{description && <p id={`${switchId}-desc`} className="av-hint">{description}</p>}</div><Primitive.Root id={switchId} className="av-switch" aria-describedby={description ? `${switchId}-desc` : undefined} {...props}><Primitive.Thumb className="av-switch-thumb"/></Primitive.Root></div>; }
