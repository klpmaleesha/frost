'use client';
import { DropdownMenu as P } from 'radix-ui';
import type { ComponentProps } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { withClass } from './utils';
export const DropdownMenu=P.Root;export const DropdownMenuTrigger=P.Trigger;export const DropdownMenuGroup=P.Group;export const DropdownMenuSub=P.Sub;export const DropdownMenuRadioGroup=P.RadioGroup;
export function DropdownMenuContent({className='',sideOffset=8,...props}:ComponentProps<typeof P.Content>){return <P.Portal><P.Content className={`av-menu-content ${className}`} sideOffset={sideOffset} {...props}/></P.Portal>;}
export const DropdownMenuItem=withClass(P.Item,'av-menu-item');export const DropdownMenuLabel=withClass(P.Label,'av-menu-label');export const DropdownMenuSeparator=withClass(P.Separator,'av-menu-separator');export const DropdownMenuShortcut=withClass('span','av-command-shortcut');
export function DropdownMenuCheckboxItem({children,...props}:ComponentProps<typeof P.CheckboxItem>){return <P.CheckboxItem className="av-menu-item" {...props}>{children}<P.ItemIndicator><Check size={14}/></P.ItemIndicator></P.CheckboxItem>;}
export function DropdownMenuRadioItem({children,...props}:ComponentProps<typeof P.RadioItem>){return <P.RadioItem className="av-menu-item" {...props}>{children}<P.ItemIndicator><Check size={14}/></P.ItemIndicator></P.RadioItem>;}
export function DropdownMenuSubTrigger({children,...props}:ComponentProps<typeof P.SubTrigger>){return <P.SubTrigger className="av-menu-item" {...props}>{children}<ChevronRight size={14}/></P.SubTrigger>;}
export const DropdownMenuSubContent=withClass(P.SubContent,'av-menu-content');
