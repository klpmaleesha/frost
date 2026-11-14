'use client';
import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverTrigger, PopoverContent } from './popover';
export function DatePicker({value,onChange,label='Pick a date',disabled}:{value?:Date;onChange?:(date:Date|undefined)=>void;label?:string;disabled?:boolean}){const[open,setOpen]=useState(false);const[internal,setInternal]=useState<Date>();const selected=value||internal;return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button variant="secondary" disabled={disabled} aria-label={label}><CalendarDays size={15}/>{selected?format(selected,'MMM d, yyyy'):label}</Button></PopoverTrigger><PopoverContent className="av-date-popover"><Calendar mode="single" selected={selected} onSelect={date=>{setInternal(date);onChange?.(date);if(date)setOpen(false)}} autoFocus/></PopoverContent></Popover>;}
