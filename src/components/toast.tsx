'use client';
import { Toaster as P, toast } from 'sonner';
import type { ComponentProps } from 'react';
export { toast };
export function Toaster(props:ComponentProps<typeof P>){return <P closeButton position="bottom-right" {...props} toastOptions={{...props.toastOptions,className:`av-toast ${props.toastOptions?.className||''}`}}/>;}
