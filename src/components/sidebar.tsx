'use client';
import { createContext, useContext, useState, type HTMLAttributes, type ReactNode } from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from './button';
import { withClass } from './utils';
const Context=createContext<{open:boolean;setOpen:(v:boolean)=>void}>({open:true,setOpen:()=>{}});
export function SidebarProvider({children,defaultOpen=true}:{children:ReactNode;defaultOpen?:boolean}){const[open,setOpen]=useState(defaultOpen);return <Context.Provider value={{open,setOpen}}><div className="av-sidebar-provider">{children}</div></Context.Provider>;}
export function useSidebar(){return useContext(Context);}
export function Sidebar({className='',...props}:HTMLAttributes<HTMLElement>){const{open}=useSidebar();return <aside hidden={!open} className={`av-sidebar ${className}`} {...props}/>;}
export function SidebarTrigger(){const{open,setOpen}=useSidebar();return <Button variant="ghost" size="icon" aria-label="Toggle sidebar" aria-expanded={open} onClick={()=>setOpen(!open)}><PanelLeft size={16}/></Button>;}
export const SidebarHeader=withClass('div','av-sidebar-header');export const SidebarContent=withClass('div','av-sidebar-content');export const SidebarFooter=withClass('div','av-sidebar-footer');export const SidebarGroup=withClass('div','av-sidebar-group');export const SidebarGroupLabel=withClass('div','av-menu-label');export const SidebarMenu=withClass('ul','av-sidebar-menu');export const SidebarMenuItem=withClass('li','av-sidebar-menu-item');export const SidebarMenuButton=withClass('button','av-sidebar-menu-button');export const SidebarInset=withClass('main','av-sidebar-inset');
