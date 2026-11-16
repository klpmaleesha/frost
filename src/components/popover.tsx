'use client';
import {useFrostScopeProps} from './frost';
import { Popover as P } from 'radix-ui';
import type { ComponentProps } from 'react';
export const Popover=P.Root;export const PopoverTrigger=P.Trigger;export const PopoverAnchor=P.Anchor;export const PopoverClose=P.Close;
export function PopoverContent({className='',sideOffset=8,align='center',...props}:ComponentProps<typeof P.Content>){const frostScope=useFrostScopeProps();return <P.Portal><P.Content {...frostScope} collisionPadding={12} sideOffset={sideOffset} align={align} className={`av-popover-content ${className}`} {...props}/></P.Portal>;}
