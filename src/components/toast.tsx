'use client';
import { Toaster as P, toast } from 'sonner';
import type { ComponentProps } from 'react';
import {useFrostScopeProps} from './frost';
export { toast };
export function Toaster(props:ComponentProps<typeof P>){const scope=useFrostScopeProps();return <div {...scope} style={{display:'contents'}}><P closeButton position="bottom-right" {...props} toastOptions={{...props.toastOptions,className:`av-toast ${props.toastOptions?.className||''}`}}/></div>;}
