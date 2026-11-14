'use client';
import type { ComponentProps, ReactNode } from 'react';
import { Accordion as Primitive } from 'radix-ui';
import { Plus } from 'lucide-react';
export const Accordion = Primitive.Root;
export function AccordionItem({title, children, className = '', ...props}: ComponentProps<typeof Primitive.Item> & {title: string; children: ReactNode}) { return <Primitive.Item className={`av-accordion-item ${className}`} {...props}><Primitive.Header><Primitive.Trigger className="av-accordion-trigger">{title}<Plus size={16}/></Primitive.Trigger></Primitive.Header><Primitive.Content className="av-accordion-content"><div>{children}</div></Primitive.Content></Primitive.Item>; }
