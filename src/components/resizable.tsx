'use client';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';
import type { ComponentProps } from 'react';
export function ResizablePanelGroup({className='',...props}:ComponentProps<typeof Group>){return <Group className={`av-resizable-group ${className}`} {...props}/>;}
export function ResizablePanel({style,...props}:ComponentProps<typeof Panel>){return <Panel style={{minWidth:0,minHeight:0,overflow:'auto',...style}} {...props}/>;}
export function ResizableHandle({className='',...props}:ComponentProps<typeof Separator>){return <Separator className={`av-resizable-handle ${className}`} {...props}><GripVertical size={12}/></Separator>;}
