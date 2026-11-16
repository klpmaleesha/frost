'use client';
import {useFrostScopeProps} from './frost';
import {createOverlayRoot,useOverlayState} from './overlay-presence';
import { Dialog as P } from 'radix-ui';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { withClass } from './utils';
export const Sheet=createOverlayRoot(P.Root);export const SheetTrigger=P.Trigger;export const SheetClose=P.Close;export const SheetTitle=withClass(P.Title,'av-dialog-title');export const SheetDescription=withClass(P.Description,'av-dialog-description');export const SheetHeader=withClass('div','av-sheet-header');export const SheetFooter=withClass('div','av-dialog-footer');
export function SheetContent({side='right',children,className='',...props}:ComponentProps<typeof P.Content>&{side?:'left'|'right'|'top'|'bottom'}){const frostScope=useFrostScopeProps(),state=useOverlayState();return <P.Portal><div className="av-overlay-layer" data-state={state}><P.Overlay className="av-dialog-overlay"/><P.Content {...frostScope} className={`av-sheet-content av-sheet--${side} ${className}`} {...props}><div className="av-sheet-scroll">{children}</div><P.Close aria-label="Close panel" className="av-sheet-close av-icon-button"><X size={18}/></P.Close></P.Content></div></P.Portal>;}
