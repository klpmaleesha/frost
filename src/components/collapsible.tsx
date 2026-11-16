'use client';
import { Collapsible as P } from 'radix-ui';
import { withClass } from './utils';
export const Collapsible=withClass(P.Root,'av-collapsible frost-surface');export const CollapsibleTrigger=P.Trigger;export const CollapsibleContent=withClass(P.Content,'av-collapsible-content');
