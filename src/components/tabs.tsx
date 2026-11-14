'use client';
import type { ComponentProps } from 'react';
import { Tabs as Primitive } from 'radix-ui';
export const Tabs = Primitive.Root;
export function TabsList({className = '', ...props}: ComponentProps<typeof Primitive.List>) { return <Primitive.List className={`av-tabs-list ${className}`} {...props}/>; }
export function TabsTrigger({className = '', ...props}: ComponentProps<typeof Primitive.Trigger>) { return <Primitive.Trigger className={`av-tabs-trigger ${className}`} {...props}/>; }
export function TabsContent({className = '', ...props}: ComponentProps<typeof Primitive.Content>) { return <Primitive.Content className={`av-tabs-content ${className}`} {...props}/>; }
