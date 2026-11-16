import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import {defaultFrostConfig,type FrostConfig} from './components/frost-engine';
export function usePreference<T>(key:string,fallback:T,parse?:(value:unknown)=>T):[T,Dispatch<SetStateAction<T>>]{
 const[value,setValue]=useState<T>(()=>{try{const raw=localStorage.getItem(key);if(raw===null)return fallback;const decoded:unknown=JSON.parse(raw);return parse?parse(decoded):typeof decoded===typeof fallback?decoded as T:fallback}catch{return fallback}});
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{/* Storage can be unavailable without affecting controls. */}},[key,value]);return[value,setValue];
}
export function restoreConfig(value:unknown):FrostConfig{
 const result={...defaultFrostConfig};if(!value||typeof value!=='object')return result;const input=value as Record<string,unknown>;
 for(const key of Object.keys(result) as (keyof FrostConfig)[]){const next=input[key];if(typeof result[key]==='number'&&typeof next==='number'&&Number.isFinite(next))Object.assign(result,{[key]:next});else if(typeof result[key]==='boolean'&&typeof next==='boolean')Object.assign(result,{[key]:next});}
 if(['frost','clear','dense'].includes(String(input.material)))result.material=input.material as FrostConfig['material'];if(['full','economy','solid'].includes(String(input.quality)))result.quality=input.quality as FrostConfig['quality'];if(/^#[\da-f]{6}$/i.test(String(input.tint)))result.tint=String(input.tint);
 if(input.lighting&&typeof input.lighting==='object'){const light=input.lighting as Record<string,unknown>;result.lighting={};if(Array.isArray(light.direction)&&light.direction.length===3&&light.direction.every(n=>typeof n==='number'&&Number.isFinite(n)))result.lighting.direction=light.direction as [number,number,number];if(typeof light.intensity==='number'&&Number.isFinite(light.intensity))result.lighting.intensity=light.intensity;if(typeof light.ambient==='number'&&Number.isFinite(light.ambient))result.lighting.ambient=light.ambient;if(/^#[\da-f]{6}$/i.test(String(light.color)))result.lighting.color=String(light.color)}
 return result;
}
