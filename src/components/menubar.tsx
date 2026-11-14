'use client';
import { Menubar as P } from 'radix-ui';
import type { ComponentProps } from 'react';
import { withClass } from './utils';
export const Menubar=withClass(P.Root,'av-menubar frost-surface');export const MenubarMenu=P.Menu;export const MenubarTrigger=withClass(P.Trigger,'av-menubar-trigger');export const MenubarItem=withClass(P.Item,'av-menu-item');export const MenubarSeparator=withClass(P.Separator,'av-menu-separator');export const MenubarCheckboxItem=withClass(P.CheckboxItem,'av-menu-item');export const MenubarRadioGroup=P.RadioGroup;export const MenubarRadioItem=withClass(P.RadioItem,'av-menu-item');export const MenubarSub=P.Sub;export const MenubarSubTrigger=withClass(P.SubTrigger,'av-menu-item');export const MenubarSubContent=withClass(P.SubContent,'av-menu-content');
export function MenubarContent(props:ComponentProps<typeof P.Content>){return <P.Portal><P.Content sideOffset={8} {...props} className={`av-menu-content ${props.className||''}`}/></P.Portal>;}
