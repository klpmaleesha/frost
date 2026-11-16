'use client';
import {useFrostScopeProps} from './frost';
import { ContextMenu as P } from 'radix-ui';
import type { ComponentProps } from 'react';
import { withClass } from './utils';
export const ContextMenu=P.Root;export const ContextMenuTrigger=P.Trigger;export const ContextMenuGroup=P.Group;export const ContextMenuSub=P.Sub;export const ContextMenuRadioGroup=P.RadioGroup;
export function ContextMenuContent(props:ComponentProps<typeof P.Content>){const frostScope=useFrostScopeProps();return <P.Portal><P.Content {...frostScope} {...props} className={`av-menu-content ${props.className||''}`}/></P.Portal>;}
export const ContextMenuItem=withClass(P.Item,'av-menu-item');export const ContextMenuLabel=withClass(P.Label,'av-menu-label');export const ContextMenuSeparator=withClass(P.Separator,'av-menu-separator');export const ContextMenuCheckboxItem=withClass(P.CheckboxItem,'av-menu-item');export const ContextMenuRadioItem=withClass(P.RadioItem,'av-menu-item');export const ContextMenuSubTrigger=withClass(P.SubTrigger,'av-menu-item');export const ContextMenuSubContent=withClass(P.SubContent,'av-menu-content');
