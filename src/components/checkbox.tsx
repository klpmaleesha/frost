'use client';
import { useId, type ComponentProps } from 'react';
import { Checkbox as Primitive } from 'radix-ui';
import { Check, Minus } from 'lucide-react';
export interface CheckboxProps extends ComponentProps<typeof Primitive.Root> { label: string; description?: string }
export function Checkbox({label, description, id, className = '', ...props}: CheckboxProps) { const generated = useId(); const checkboxId = id || generated; return <div className={`av-checkbox-row ${className}`}><Primitive.Root id={checkboxId} className="av-checkbox" aria-describedby={description ? `${checkboxId}-desc` : undefined} {...props}><Primitive.Indicator>{props.checked === 'indeterminate' ? <Minus size={12}/> : <Check size={12}/>}</Primitive.Indicator></Primitive.Root><div><label className="av-label" htmlFor={checkboxId}>{label}</label>{description && <p id={`${checkboxId}-desc`} className="av-hint">{description}</p>}</div></div>; }
