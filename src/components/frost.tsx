'use client';
import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { FrostEngine, defaultFrostConfig, type FrostConfig, type FrostTelemetry } from './frost-engine';
import type { FrostSceneKind } from './frost-optics';
import type {FrostMaterial} from './frost-material';
export {materialPresets,elevations,defaultLighting,materialMetrics} from './frost-material';
export type {FrostLighting,FrostMaterial,FrostDiagnostic} from './frost-material';
export type { FrostSceneKind } from './frost-optics';
export { FrostEngine, defaultFrostConfig, frostPresets } from './frost-engine';
export type { FrostConfig, FrostTelemetry } from './frost-engine';
export { MotionPredictor, springStep, resist } from './frost-physics';
const FrostContext=createContext<FrostEngine|null>(null);
const useMountEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
export function FrostProvider({children,config={}}:{children:ReactNode;config?:Partial<FrostConfig>}){
  const [engine]=useState(()=>new FrostEngine(config));
  useMountEffect(()=>engine.mount(),[engine]);
  useEffect(()=>engine.update(config),[engine,config]);
  return <FrostContext.Provider value={engine}>{children}</FrostContext.Provider>;
}
export function useFrost(){const engine=useContext(FrostContext);return engine;}
export function useFrostTelemetry(){
  const engine=useFrost();const[stats,setStats]=useState<FrostTelemetry>({surfaces:0,active:0,fps:0,velocity:0,prediction:24,reducedMotion:false});
  useEffect(()=>engine?.subscribe(setStats),[engine]);return stats;
}
export interface FrostSurfaceProps extends HTMLAttributes<HTMLDivElement>{material?:FrostMaterial;elevation?:number;thickness?:number}
export const FrostSurface=forwardRef<HTMLDivElement,FrostSurfaceProps>(function FrostSurface({className='',material,elevation,thickness,...props},ref){return <div ref={ref} className={`frost-surface ${className}`} data-frost-material={material} data-frost-elevation={elevation} data-frost-thickness={thickness} {...props}/>;});
export function FrostScene({kind='grid',image='/material-landscape.jpg',className='',...props}:HTMLAttributes<HTMLDivElement>&{kind?:FrostSceneKind;image?:string}){return <div data-frost-scene={kind} data-frost-image={image} className={`frost-scene ${className}`} {...props}/>;}

export function FrostMorph({expanded,compact={width:200,height:52,radius:26},open={width:360,height:200,radius:20},children,className=''}:{expanded:boolean;compact?:{width:number;height:number;radius:number};open?:{width:number;height:number;radius:number};children:ReactNode;className?:string}){const engine=useFrost(),ref=useRef<HTMLDivElement>(null);const width=expanded?open.width:compact.width,height=expanded?open.height:compact.height,radius=expanded?open.radius:compact.radius;useEffect(()=>{if(ref.current){engine?.register(ref.current);engine?.morph(ref.current,{width,height,radius})}},[engine,width,height,radius]);return <div className={`frost-surface frost-morph ${className}`} ref={ref} style={{width:compact.width,height:compact.height,borderRadius:compact.radius}}>{children}</div>;}
