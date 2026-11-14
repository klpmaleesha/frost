import type { HTMLAttributes } from 'react';
export function Marker({color='currentColor',className='',...props}:HTMLAttributes<HTMLSpanElement>&{color?:string}){return <span {...props} className={`av-marker ${className}`} style={{background:color,...props.style}}/>;}
