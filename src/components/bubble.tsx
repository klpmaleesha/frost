import type { HTMLAttributes } from 'react';
export function Bubble({side='incoming',className='',...props}:HTMLAttributes<HTMLDivElement>&{side?:'incoming'|'outgoing'}){return <div className={`av-bubble av-bubble--${side} frost-surface ${className}`} {...props}/>;}
