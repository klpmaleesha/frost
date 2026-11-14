'use client';
import { ScrollArea as P } from 'radix-ui';
import type { ComponentProps } from 'react';
export function ScrollArea({children,className='',...props}:ComponentProps<typeof P.Root>){return <P.Root className={`av-scroll-area ${className}`} {...props}><P.Viewport className="av-scroll-viewport">{children}</P.Viewport><P.Scrollbar orientation="vertical" className="av-scrollbar"><P.Thumb className="av-scroll-thumb"/></P.Scrollbar><P.Scrollbar orientation="horizontal" className="av-scrollbar"><P.Thumb className="av-scroll-thumb"/></P.Scrollbar><P.Corner/></P.Root>;}
