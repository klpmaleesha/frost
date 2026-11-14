import type { HTMLAttributes } from 'react';
export function ButtonGroup({className='',...props}:HTMLAttributes<HTMLDivElement>){return <div role="group" className={`av-button-group ${className}`} {...props}/>;}
