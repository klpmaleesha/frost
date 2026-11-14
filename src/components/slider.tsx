'use client';
import { Slider as P } from 'radix-ui';
import { useId, type ComponentProps } from 'react';
export function Slider({label,className='',value,defaultValue=[50],...props}:ComponentProps<typeof P.Root>&{label?:string}){const id=useId();return <div className="av-slider-wrap">{label&&<label id={id} className="av-label">{label}</label>}<P.Root className={`av-slider ${className}`} value={value} defaultValue={defaultValue} aria-labelledby={label?id:props['aria-labelledby']} {...props}><P.Track className="av-slider-track"><P.Range className="av-slider-range"/></P.Track>{(value||defaultValue).map((_,i)=><P.Thumb key={i} className="av-slider-thumb frost-surface" aria-label={label?`${label}${(value||defaultValue).length>1?` ${i+1}`:''}`:props['aria-label']||'Value'}/>)}</P.Root></div>;}
