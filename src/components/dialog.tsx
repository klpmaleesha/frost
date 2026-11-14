'use client';
import type { ComponentProps, ReactNode } from 'react';
import { Dialog as Primitive } from 'radix-ui';
import { X } from 'lucide-react';
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export interface DialogContentProps extends ComponentProps<typeof Primitive.Content> { title: string; description?: string; children: ReactNode }
export function DialogContent({ title, description, children, className = '', ...props }: DialogContentProps) { return <Primitive.Portal><div className="av-overlay-layer"><Primitive.Overlay className="av-dialog-overlay"/><Primitive.Content className={`av-dialog-content ${className}`} {...props}><div className="av-dialog-heading"><Primitive.Title>{title}</Primitive.Title><Primitive.Close className="av-icon-button" aria-label="Close dialog"><X size={18}/></Primitive.Close></div>{description ? <Primitive.Description className="av-dialog-description">{description}</Primitive.Description> : <Primitive.Description className="av-sr-only">{title}</Primitive.Description>}<div className="av-dialog-scroll">{children}</div></Primitive.Content></div></Primitive.Portal>; }
