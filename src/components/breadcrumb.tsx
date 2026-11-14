import { ChevronRight } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import { withClass } from './utils';
export function Breadcrumb(props:HTMLAttributes<HTMLElement>){return <nav aria-label="Breadcrumb" {...props}/>;}
export const BreadcrumbList=withClass('ol','av-breadcrumb-list');export const BreadcrumbItem=withClass('li','av-breadcrumb-item');export const BreadcrumbLink=withClass('a','av-breadcrumb-link');
export function BreadcrumbPage(props:HTMLAttributes<HTMLSpanElement>){return <span aria-current="page" {...props}/>;}
export function BreadcrumbSeparator(){return <li role="presentation" aria-hidden="true" className="av-breadcrumb-separator"><ChevronRight size={13}/></li>;}
