'use client';
import { AlertDialog as P } from 'radix-ui';
import { withClass } from './utils';
import type { ComponentProps } from 'react';
export const AlertDialog=P.Root;export const AlertDialogTrigger=P.Trigger;export const AlertDialogTitle=withClass(P.Title,'av-dialog-title');export const AlertDialogDescription=withClass(P.Description,'av-dialog-description');
export const AlertDialogAction=withClass(P.Action,'av-button av-button--primary');export const AlertDialogCancel=withClass(P.Cancel,'av-button av-button--secondary');
export const AlertDialogHeader=withClass('div','av-dialog-header');export const AlertDialogFooter=withClass('div','av-dialog-footer');
export function AlertDialogContent({children,className='',...props}:ComponentProps<typeof P.Content>){return <P.Portal><div className="av-overlay-layer"><P.Overlay className="av-dialog-overlay"/><P.Content {...props} className={`av-dialog-content ${className}`}><div className="av-dialog-scroll">{children}</div></P.Content></div></P.Portal>;}
