'use client';
import type { ReactElement } from 'react';
import { Tooltip as Primitive } from 'radix-ui';
export function Tooltip({content, children}: {content: string; children: ReactElement}) {return <Primitive.Provider delayDuration={300}><Primitive.Root><Primitive.Trigger asChild>{children}</Primitive.Trigger><Primitive.Portal><Primitive.Content className="av-tooltip" sideOffset={8}>{content}<Primitive.Arrow className="av-tooltip-arrow"/></Primitive.Content></Primitive.Portal></Primitive.Root></Primitive.Provider>;}
