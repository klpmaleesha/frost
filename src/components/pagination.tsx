import type { ComponentProps } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { withClass } from './utils';
export function Pagination(props:ComponentProps<'nav'>){return <nav aria-label="Pagination" {...props}/>;}
export const PaginationContent=withClass('ul','av-pagination-content');export const PaginationItem=withClass('li','av-pagination-item');
export function PaginationLink({isActive,className='',...props}:ComponentProps<'button'>&{isActive?:boolean}){return <button type="button" aria-current={isActive?'page':undefined} className={`av-pagination-link ${isActive?'active':''} ${className}`} {...props}/>;}
export function PaginationPrevious(props:ComponentProps<'button'>){return <PaginationLink aria-label="Previous page" {...props}><ChevronLeft size={14}/></PaginationLink>;}
export function PaginationNext(props:ComponentProps<'button'>){return <PaginationLink aria-label="Next page" {...props}><ChevronRight size={14}/></PaginationLink>;}
export function PaginationEllipsis(){return <span className="av-pagination-ellipsis"><MoreHorizontal size={15}/><span className="av-sr-only">More pages</span></span>;}
