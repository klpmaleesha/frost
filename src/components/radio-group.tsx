'use client';
import { RadioGroup as P } from 'radix-ui';
import { useId, type ComponentProps } from 'react';
import { withClass } from './utils';
export const RadioGroup=withClass(P.Root,'av-radio-group');
export function RadioGroupItem({label,description,id,...props}:ComponentProps<typeof P.Item>&{label?:string;description?:string}){const auto=useId();const itemId=id||auto;return <div className="av-radio-row"><P.Item id={itemId} className="av-radio" aria-describedby={description?`${itemId}-hint`:undefined} {...props}><P.Indicator className="av-radio-indicator"/></P.Item>{(label||description)&&<div>{label&&<label htmlFor={itemId} className="av-label">{label}</label>}{description&&<p className="av-hint" id={`${itemId}-hint`}>{description}</p>}</div>}</div>;}
