'use client';
import {useFrostScopeProps} from './frost';
import { HoverCard as P } from 'radix-ui';
import type { ComponentProps } from 'react';
export const HoverCard=P.Root;export const HoverCardTrigger=P.Trigger;
export function HoverCardContent({className='',sideOffset=8,...props}:ComponentProps<typeof P.Content>){const frostScope=useFrostScopeProps();return <P.Portal><P.Content {...frostScope} className={`av-popover-content ${className}`} sideOffset={sideOffset} {...props}/></P.Portal>;}
