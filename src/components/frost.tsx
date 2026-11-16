'use client';
import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState, useMemo, useId, type HTMLAttributes, type ReactNode } from 'react';
import { FrostEngine, defaultFrostConfig, type FrostConfig, type FrostTelemetry } from './frost-engine';
import type { FrostSceneKind } from './frost-optics';
import type {FrostMaterial} from './frost-material';
export {materialPresets,elevations,defaultLighting,materialMetrics} from './frost-material';
export type {FrostLighting,FrostMaterial,FrostDiagnostic} from './frost-material';
export type { FrostSceneKind } from './frost-optics';
export { FrostEngine, defaultFrostConfig, frostPresets } from './frost-engine';
export type { FrostConfig, FrostTelemetry } from './frost-engine';
export { MotionPredictor, springStep, resist } from './frost-physics';
export type FrostController=Pick<FrostEngine,'register'|'excite'|'morph'|'glide'|'startDrag'|'moveDrag'|'inspect'|'subscribe'|'getTelemetry'|'getResources'>&{update:(config:Partial<FrostConfig>)=>void;readonly config:FrostConfig};
const FrostContext=createContext<{engine:FrostEngine;controller:FrostController;scope:string;config:FrostConfig}|null>(null);
const useMountEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
let sharedEngine:FrostEngine|null=null,providers=0;
export function FrostProvider({children,config={}}:{children:ReactNode;config?:Partial<FrostConfig>}){
 const parent=useContext(FrostContext),scope='frost-'+useId().replace(/[^a-zA-Z0-9_-]/g,''),root=useRef<HTMLDivElement>(null);
 const[engine]=useState(()=>parent?.engine||(typeof document==='undefined'?new FrostEngine():sharedEngine||(sharedEngine=new FrostEngine())));
 const resolved=useMemo(()=>({...defaultFrostConfig,...parent?.config,...config,lighting:{...parent?.config.lighting,...config.lighting}}),[parent?.config,config]);
 const controller=useMemo<FrostController>(()=>({get config(){return engine.scopeConfig(scope)},update:patch=>{if(root.current)engine.setScope(scope,root.current,patch)},register:el=>engine.register(el),excite:(el,strength,x,y)=>engine.excite(el,strength,x,y),glide:(el,x,y)=>engine.glide(el,x,y),morph:(el,target)=>engine.morph(el,target),startDrag:(el,event)=>engine.startDrag(el,event),moveDrag:(el,x,y)=>engine.moveDrag(el,x,y),inspect:el=>engine.inspect(el),subscribe:fn=>engine.subscribe(fn),getResources:()=>engine.getResources(),getTelemetry:()=>engine.getTelemetry()}),[engine,scope]);
 useMountEffect(()=>{if(providers++===0)engine.mount();if(root.current)engine.setScope(scope,root.current,resolved);return()=>{engine.removeScope(scope);if(--providers===0)engine.destroy()}},[engine,scope]);
 useEffect(()=>{if(root.current)engine.setScope(scope,root.current,resolved)},[engine,scope,resolved]);
 return <FrostContext.Provider value={{engine,controller,scope,config:resolved}}><div ref={root} data-frost-scope={scope} style={{display:'contents'}}>{children}</div></FrostContext.Provider>;
}
export function useFrost(){return useContext(FrostContext)?.controller||null;}
export function useFrostScopeProps(){const context=useContext(FrostContext);return context?{'data-frost-scope':context.scope}:{};}
export function useFrostTelemetry(){
  const engine=useFrost();const[stats,setStats]=useState<FrostTelemetry>({surfaces:0,active:0,fps:0,velocity:0,prediction:24,reducedMotion:false});
  useEffect(()=>engine?.subscribe(setStats),[engine]);return stats;
}
export interface FrostSurfaceProps extends HTMLAttributes<HTMLDivElement>{material?:FrostMaterial;elevation?:number;thickness?:number}
export const FrostSurface=forwardRef<HTMLDivElement,FrostSurfaceProps>(function FrostSurface({className='',material,elevation,thickness,...props},ref){return <div ref={ref} className={`frost-surface ${className}`} data-frost-material={material} data-frost-elevation={elevation} data-frost-thickness={thickness} {...props}/>;});
export function FrostScene({kind='grid',image='/material-landscape.jpg',className='',...props}:HTMLAttributes<HTMLDivElement>&{kind?:FrostSceneKind;image?:string}){return <div data-frost-scene={kind} data-frost-image={image} className={`frost-scene ${className}`} {...props}/>;}

export function FrostMorph({expanded,compact={width:200,height:52,radius:26},open={width:360,height:200,radius:20},children,className=''}:{expanded:boolean;compact?:{width:number;height:number;radius:number};open?:{width:number;height:number;radius:number};children:ReactNode;className?:string}){const engine=useFrost(),ref=useRef<HTMLDivElement>(null);const width=expanded?open.width:compact.width,height=expanded?open.height:compact.height,radius=expanded?open.radius:compact.radius;useEffect(()=>{if(ref.current){engine?.register(ref.current);engine?.morph(ref.current,{width,height,radius})}},[engine,width,height,radius]);return <div className={`frost-surface frost-morph ${className}`} ref={ref} style={{width:compact.width,height:compact.height,borderRadius:compact.radius}}>{children}</div>;}
