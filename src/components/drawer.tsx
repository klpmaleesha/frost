'use client';
import {useFrostScopeProps} from './frost';
import {createOverlayRoot,useOverlayState} from './overlay-presence';
import { Drawer as P } from 'vaul';
import type { ComponentProps } from 'react';
import { withClass } from './utils';
export const Drawer=createOverlayRoot(P.Root);export const DrawerTrigger=P.Trigger;export const DrawerClose=P.Close;export const DrawerTitle=withClass(P.Title,'av-dialog-title');export const DrawerDescription=withClass(P.Description,'av-dialog-description');export const DrawerHeader=withClass('div','av-drawer-header');export const DrawerFooter=withClass('div','av-dialog-footer');
export function DrawerContent({children,className='',...props}:ComponentProps<typeof P.Content>){const frostScope=useFrostScopeProps(),state=useOverlayState();return <P.Portal><div className="av-overlay-layer" data-state={state}><P.Overlay className="av-dialog-overlay"/><P.Content {...frostScope} className={`av-drawer-content av-sheet-content ${className}`} {...props}><div className="av-drawer-handle"/><div className="av-sheet-scroll">{children}</div></P.Content></div></P.Portal>;}
