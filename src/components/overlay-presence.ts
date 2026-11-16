'use client';
import {createContext,createElement,useContext,useState,type ComponentType} from 'react';

const OverlayState=createContext(false);
interface OpenState {open?:boolean;defaultOpen?:boolean;onOpenChange?:(open:boolean)=>void}
/** Give the portal's stacking frame the same presence lifetime as its content. */
export function createOverlayRoot<P extends OpenState>(Root:ComponentType<P>){
 return function OverlayRoot(props:P){
  const [internal,setInternal]=useState(props.defaultOpen??false),open=props.open??internal;
  const change=(next:boolean)=>{if(props.open===undefined)setInternal(next);props.onOpenChange?.(next)};
  return createElement(OverlayState.Provider,{value:open},createElement(Root,{...props,open,onOpenChange:change}));
 };
}
export function useOverlayState(){return useContext(OverlayState)?'open':'closed'}
