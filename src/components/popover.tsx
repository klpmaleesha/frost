'use client';
import { Popover as P } from 'radix-ui';
import type { ComponentProps } from 'react';
export const Popover=P.Root;export const PopoverTrigger=P.Trigger;export const PopoverAnchor=P.Anchor;export const PopoverClose=P.Close;
export function PopoverContent({className='',sideOffset=8,align='center',...props}:ComponentProps<typeof P.Content>){return <P.Portal><P.Content collisionPadding={12} sideOffset={sideOffset} align={align} className={`av-popover-content ${className}`} {...props}/></P.Portal>;}
