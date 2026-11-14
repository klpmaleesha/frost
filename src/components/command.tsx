'use client';
import { Command as P } from 'cmdk';
import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';
import { withClass } from './utils';
export const Command=withClass(P,'av-command');
export function CommandInput(props:ComponentProps<typeof P.Input>){return <div className="av-command-input-wrap"><Search size={16}/><P.Input className="av-command-input" {...props}/></div>;}
export const CommandList=withClass(P.List,'av-command-list');export const CommandEmpty=withClass(P.Empty,'av-command-empty');export const CommandGroup=withClass(P.Group,'av-command-group');export const CommandItem=withClass(P.Item,'av-command-item');export const CommandSeparator=withClass(P.Separator,'av-separator');export const CommandShortcut=withClass('span','av-command-shortcut');
