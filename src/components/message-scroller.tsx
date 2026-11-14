'use client';
import { useRef, useEffect, type HTMLAttributes } from 'react';
export function MessageScroller({children,className='',...props}:HTMLAttributes<HTMLDivElement>){const ref=useRef<HTMLDivElement>(null);const pinned=useRef(true);useEffect(()=>{const el=ref.current;if(el&&pinned.current)el.scrollTop=el.scrollHeight;},[children]);return <div ref={ref} role="log" aria-live="polite" className={`av-message-scroller ${className}`} onScroll={e=>{const el=e.currentTarget;pinned.current=el.scrollHeight-el.scrollTop-el.clientHeight<48}} {...props}>{children}</div>;}
