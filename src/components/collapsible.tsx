'use client';
import { Collapsible as P } from 'radix-ui';
import { withClass } from './utils';
export const Collapsible=P.Root;export const CollapsibleTrigger=P.Trigger;export const CollapsibleContent=withClass(P.Content,'av-collapsible-content');
