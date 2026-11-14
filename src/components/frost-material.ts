import {clamp} from './frost-physics';
export interface FrostLighting {direction:[number,number,number];intensity:number;color:string;ambient:number}
export type FrostMaterial='frost'|'clear'|'dense';
export type FrostDiagnostic='none'|'normals'|'curvature'|'thickness'|'lighting'|'pointer';
export const defaultLighting:FrostLighting={direction:[-.5,-.72,.9],intensity:.8,color:'#fffaf5',ambient:.28};
export const materialPresets={frost:{blur:24,roughness:.2,transmission:.6,body:.32},clear:{blur:12,roughness:.08,transmission:.84,body:.16},dense:{blur:28,roughness:.4,transmission:.28,body:.66}} as const;
export const elevations={inset:0,control:1,card:2,popover:3,dialog:4} as const;
/** Perceptual relationships, not a simulation of optical units. Pure so the model can be tested. */
export function materialMetrics(width:number,height:number,thickness:number,material:FrostMaterial='frost',elevation=1,nesting=0){
 const t=clamp(thickness,.2,3),size=clamp(Math.sqrt(Math.max(1,Math.min(width,height))/44),.55,2.8),preset=materialPresets[material];
 return {thickness:t,size,rim:clamp((2.2+Math.sqrt(t)*1.5)*size,1.5,10),edge:clamp(.58+Math.sqrt(t)*.2+size*.08,.7,1.25),refraction:clamp((1.2+t*2.1)*Math.min(size,1.5),.5,10),absorption:1-Math.exp(-t*.12),shade:clamp(.055+t*.025,.06,.13),grain:.0015+Math.min(size,1.8)*.0006,body:clamp(preset.body+Math.min(nesting,3)*.045,.1,.86),blur:preset.blur/(1+Math.min(nesting,3)*.35),shadowY:.5+Math.pow(clamp(elevation,0,5),1.35)*2.4,shadowBlur:3+Math.pow(clamp(elevation,0,5),1.2)*8,contact:clamp(.09-elevation*.01,.025,.09)};
}
export function lightingEnvironment(value:Partial<FrostLighting>={}):FrostLighting{let d=value.direction||defaultLighting.direction;if(!d.every(Number.isFinite)||Math.hypot(...d)<.001)d=defaultLighting.direction;const n=Math.hypot(...d);return {direction:d.map(v=>v/n) as [number,number,number],intensity:clamp(value.intensity??defaultLighting.intensity,0,2),ambient:clamp(value.ambient??defaultLighting.ambient,0,1),color:/^#[\da-f]{6}$/i.test(value.color||'')?value.color!:defaultLighting.color};}
export function rgbColor(hex:string):[number,number,number]{return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255) as [number,number,number]}
