import { clamp, MotionPredictor, resist, springStep, type SpringState } from './frost-physics';
import { FrostOpticsRenderer } from './frost-optics';
import {materialMetrics,lightingEnvironment,rgbColor,materialPresets,type FrostLighting,type FrostMaterial,type FrostDiagnostic} from './frost-material';

export interface FrostConfig {
  material:FrostMaterial; lighting:Partial<FrostLighting>; diagnostic:FrostDiagnostic;
  blur:number; opacity:number; saturation:number; roughness:number; thickness:number;
  stiffness:number; damping:number; mass:number; resistance:number; prediction:number;
  displacement:number; tilt:number; motion:boolean; tint:string;
  edge:number; glow:number; shadow:number; quality:'full'|'economy'|'solid'; settling:number;
  edgeDiffusion:number; innerShade:number; lightAngle:number;
  deformation:number; maxDeformation:number; timeScale:number;
}
export const defaultFrostConfig:FrostConfig={material:'frost',lighting:{},diagnostic:'none',blur:24,opacity:.12,saturation:1.15,roughness:.2,thickness:1,stiffness:240,damping:26,mass:1,resistance:1.4,prediction:20,displacement:5,tilt:2,motion:true,tint:'#ffffff',edge:.7,glow:.45,shadow:.65,quality:'full',settling:.12,edgeDiffusion:.35,innerShade:.16,lightAngle:135,deformation:.45,maxDeformation:1.5,timeScale:1};
export const frostPresets:Record<'still'|'subtle'|'expressive',Partial<FrostConfig>>={still:{motion:false,deformation:0,maxDeformation:0},subtle:{motion:true,deformation:.45,maxDeformation:1.5,stiffness:240,damping:26,mass:1},expressive:{motion:true,deformation:.8,maxDeformation:2.5,stiffness:210,damping:21,mass:1.05}};
interface DragState {pointer:number;dragging:boolean;x:SpringState;y:SpringState;targetX:number;targetY:number;startX:number;startY:number;originX:number;originY:number;minX:number;maxX:number;minY:number;maxY:number;vx:number;vy:number;lastX:number;lastY:number;lastTime:number}
export interface FrostTelemetry { surfaces:number; active:number; fps:number; velocity:number; prediction:number; reducedMotion:boolean }
interface Surface {
  el:HTMLElement; rect:DOMRect; dirty:boolean; visible:boolean; hover:boolean; pressed:boolean;
  x:SpringState;y:SpringState;rx:SpringState;ry:SpringState;scale:SpringState;
  lightX:number;lightY:number;light:SpringState;statePosition:SpringState;stateTarget:number;pulse:SpringState;
  force:number;shape?:{width:SpringState;height:SpringState;radius:SpringState;target:{width:number;height:number;radius:number}};drag?:DragState;
}
const selectors='.av-badge,.av-avatar,.av-chart,.av-resizable-group,.av-native-select,.av-progress,.av-table-surface,.av-button,.av-card,.av-input-wrap,.av-textarea,.av-switch,.av-checkbox,.av-radio,.av-toggle,.av-select-trigger,.av-tabs-list,.av-dialog-content,.av-select-content,.av-popover-content,.av-menu-content,.av-alert,.av-command,.av-calendar,.av-toast,.av-sheet-content,.av-input-otp-slot,.av-sidebar,.av-tooltip,.frost-surface';
const zero=():SpringState=>({position:0,velocity:0});

/** One scheduler and one pointer pipeline for every surface, including portals. */
export class FrostEngine {
  config:FrostConfig;
  predictor=new MotionPredictor();
  private surfaces=new Map<HTMLElement,Surface>();
  private active=new Set<Surface>();
  private frame=0;private lastFrame=0;private lastReport=0;
  private pointer={x:-99999,y:-99999};private predicted={x:-99999,y:-99999};
  private listeners=new Set<(stats:FrostTelemetry)=>void>();
  private observer:MutationObserver|null=null;private resize:ResizeObserver|null=null;private intersection:IntersectionObserver|null=null;
  private transparency:MediaQueryList|null=null;private media:MediaQueryList|null=null;private root:HTMLElement|null=null;private reduced=false;
  private stats:FrostTelemetry={surfaces:0,active:0,fps:0,velocity:0,prediction:24,reducedMotion:false};
  private optics:FrostOpticsRenderer|null=null;
  private dragged:Surface|null=null;
  constructor(config:Partial<FrostConfig>={}){this.config={...defaultFrostConfig,...config};}
  mount(root:HTMLElement=document.documentElement){
    this.root=root;this.optics=new FrostOpticsRenderer();this.media=matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.media.matches;
    this.media.addEventListener('change',this.onPreference);this.transparency=matchMedia('(prefers-reduced-transparency: reduce)');this.transparency.addEventListener('change',this.onPreference);
    this.resize=new ResizeObserver(entries=>{for(const e of entries){const surface=this.surfaces.get(e.target as HTMLElement);if(surface){surface.dirty=true;this.materialize(surface);this.optics?.resizeSurface(surface.el);}}});
    this.intersection=new IntersectionObserver(entries=>{for(const e of entries){const s=this.surfaces.get(e.target as HTMLElement);if(s){s.visible=e.isIntersecting;if(!s.visible){s.hover=false;s.pressed=false;this.active.delete(s);this.resetSurface(s);}}}},{rootMargin:'60px'});
    this.scan(root);
    this.observer=new MutationObserver(mutations=>{for(const mutation of mutations){if(mutation.type==='attributes'&&mutation.target instanceof HTMLElement){if(mutation.attributeName?.startsWith('data-frost-')||mutation.attributeName==='data-theme'){this.optics?.refresh();for(const surface of this.surfaces.values())this.materialize(surface);}const s=this.surfaces.get(mutation.target);if(s){const target=this.stateOf(s.el);if(s.stateTarget!==target){s.stateTarget=target;s.pulse={position:s.pulse.position,velocity:clamp(s.pulse.velocity+2,0,4)};this.active.add(s);if(!this.config.motion||this.reduced)this.writeState(s,true);else this.wake();}}}for(const node of mutation.addedNodes)if(node instanceof HTMLElement)this.scan(node);}for(const [el] of this.surfaces)if(!el.isConnected)this.unregister(el);});
    this.observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['data-state','aria-selected','aria-checked','data-frost-scene','data-frost-light','data-frost-material','data-frost-elevation','data-frost-thickness','data-theme']});
    root.addEventListener('focusin',this.onFocus);root.addEventListener('focusout',this.onFocus);root.addEventListener('keydown',this.onKey);root.addEventListener('keyup',this.onKey);
    root.addEventListener('pointermove',this.onPointer,{passive:true});root.addEventListener('pointerover',this.onOver,{passive:true});root.addEventListener('pointerout',this.onOut,{passive:true});root.addEventListener('pointerdown',this.onDown,{passive:true});
    window.addEventListener('pointerup',this.onUp,{passive:true});window.addEventListener('pointercancel',this.onUp,{passive:true});window.addEventListener('blur',this.releaseAll);window.addEventListener('scroll',this.invalidate,{passive:true,capture:true});window.addEventListener('resize',this.invalidate,{passive:true});document.addEventListener('visibilitychange',this.onVisibility);
    this.update(this.config);return ()=>this.destroy();
  }
  update(config:Partial<FrostConfig>){
    this.config={...this.config,...config};const style=this.root?.style;if(!style)return;
    const c=this.config,env=lightingEnvironment(c.lighting);
    this.optics?.configure({lighting:env,diagnostic:c.diagnostic,quality:this.transparency?.matches?'solid':c.quality});
    style.setProperty('--frost-environment-color',env.color);style.setProperty('--frost-edge-highlight',rgbColor(env.color).map(v=>Math.round(v*255)).join(' '));style.setProperty('--frost-environment-x',`${50+env.direction[0]*38}%`);style.setProperty('--frost-environment-y',`${50+env.direction[1]*38}%`);style.setProperty('--frost-environment-intensity',`${env.intensity}`);style.setProperty('--frost-environment-ambient',`${env.ambient}`);style.setProperty('--frost-light-angle',`${Math.atan2(-env.direction[0],env.direction[1])*180/Math.PI}deg`);
    style.setProperty('--frost-blur',`${clamp(c.blur,0,60)}px`);style.setProperty('--frost-opacity',`${clamp(c.opacity,.02,.8)}`);style.setProperty('--frost-saturation',`${clamp(c.saturation,0,3)}`);style.setProperty('--frost-roughness',`${clamp(c.roughness,0,1)}`);style.setProperty('--frost-thickness',`${clamp(c.thickness,.1,4)}px`);style.setProperty('--frost-tint',c.tint);style.setProperty('--frost-edge',`${clamp(c.edge,0,1)}`);style.setProperty('--frost-glow',`${clamp(c.glow,0,1)}`);style.setProperty('--frost-shadow',`${clamp(c.shadow,0,1)}`);this.root?.setAttribute('data-frost-quality',this.transparency?.matches?'solid':c.quality);
    style.setProperty('--frost-edge-diffusion',`${clamp(c.edgeDiffusion,0,1.5)}px`);style.setProperty('--frost-inner-shade',`${clamp(c.innerShade,0,1)}`);if(c.lightAngle!==135&&!Object.keys(c.lighting).length)style.setProperty('--frost-light-angle',`${c.lightAngle}deg`);
    style.setProperty('--frost-motion-strength',`${c.motion&&!this.reduced?c.deformation:0}`);this.root?.setAttribute('data-frost-motion',c.motion&&!this.reduced?'on':'off');
    if(!c.motion||this.reduced){this.active.clear();for(const s of this.surfaces.values())this.resetSurface(s);if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;}
    for(const s of this.surfaces.values())this.materialize(s);
    this.report(0);
    this.optics?.refresh();
  }
  register(el:HTMLElement){
    if(this.surfaces.has(el)||el.closest('[data-frost-ignore]'))return;
    const target=this.stateOf(el);const s:Surface={el,rect:el.getBoundingClientRect(),dirty:true,visible:true,hover:false,pressed:false,x:zero(),y:zero(),rx:zero(),ry:zero(),scale:{position:1,velocity:0},lightX:50,lightY:25,light:zero(),statePosition:{position:target,velocity:0},stateTarget:target,pulse:zero(),force:1};
    this.surfaces.set(el,s);el.dataset.frost='';this.materialize(s);this.writeState(s,true);this.resize?.observe(el);this.intersection?.observe(el);this.optics?.register(el);
  }
  unregister(el:HTMLElement){const s=this.surfaces.get(el);if(s){this.resetSurface(s);this.active.delete(s);}this.optics?.unregister(el);this.surfaces.delete(el);this.resize?.unobserve(el);this.intersection?.unobserve(el);delete el.dataset.frost;}
  subscribe(listener:(stats:FrostTelemetry)=>void){this.listeners.add(listener);listener(this.stats);return()=>{this.listeners.delete(listener)};}
  getTelemetry(){return this.stats;}
  startDrag(el:HTMLElement,event:PointerEvent){
    const s=this.surfaces.get(el);if(!s)return;const box=el.getBoundingClientRect();const parent=el.parentElement!.getBoundingClientRect();const x=s.drag?.x||zero(),y=s.drag?.y||zero();const bounds={minX:parent.left-box.left+x.position+12,maxX:parent.right-box.right+x.position-12,minY:parent.top-box.top+y.position+12,maxY:parent.bottom-box.bottom+y.position-12};
    s.drag={pointer:event.pointerId,dragging:true,x,y,targetX:x.position,targetY:y.position,startX:event.clientX,startY:event.clientY,originX:x.position,originY:y.position,...bounds,vx:0,vy:0,lastX:event.clientX,lastY:event.clientY,lastTime:event.timeStamp};this.dragged=s;s.el.dataset.dragging='true';this.active.add(s);
  }
  moveDrag(el:HTMLElement,dx:number,dy:number){const s=this.surfaces.get(el);if(!s)return;const box=el.getBoundingClientRect(),parent=el.parentElement!.getBoundingClientRect();const x=s.drag?.x||zero(),y=s.drag?.y||zero();const tx=clamp(x.position+dx,parent.left-box.left+x.position+12,parent.right-box.right+x.position-12),ty=clamp(y.position+dy,parent.top-box.top+y.position+12,parent.bottom-box.bottom+y.position-12);s.drag={pointer:-1,dragging:false,x,y,targetX:tx,targetY:ty,startX:0,startY:0,originX:0,originY:0,minX:tx,maxX:tx,minY:ty,maxY:ty,vx:0,vy:0,lastX:0,lastY:0,lastTime:0};if(!this.config.motion||this.reduced){s.drag.x={position:tx,velocity:0};s.drag.y={position:ty,velocity:0};this.paintDrag(s);}else{this.active.add(s);this.wake();}}
  morph(el:HTMLElement,target:{width:number;height:number;radius:number}){const s=this.surfaces.get(el);if(!s)return;const box=el.getBoundingClientRect();s.shape={width:s.shape?.width||{position:box.width,velocity:0},height:s.shape?.height||{position:box.height,velocity:0},radius:s.shape?.radius||{position:parseFloat(getComputedStyle(el).borderRadius)||16,velocity:0},target};if(!this.config.motion||this.reduced){el.style.width=target.width+'px';el.style.height=target.height+'px';el.style.borderRadius=target.radius+'px';s.shape=undefined;this.materialize(s);this.optics?.refresh();}else{this.active.add(s);this.wake();}}
  inspect(el:HTMLElement){const s=this.surfaces.get(el);if(!s)return null;return {pointer:{x:s.lightX,y:s.lightY,influence:s.light.position},pressure:(1-s.scale.position)/.025,velocity:{...this.predictor.velocity},active:this.active.has(s),material:s.el.dataset.frostMaterial||this.config.material,optics:this.optics?.inspect(el)||null};}
  private materialize(s:Surface){
    const el=s.el,box=el.getBoundingClientRect(),parent=el.parentElement?.closest('[data-frost]');
    const material=(el.closest<HTMLElement>('[data-frost-material]')?.dataset.frostMaterial||this.config.material) as FrostMaterial;
    const level=Number(el.dataset.frostElevation??(el.matches('.av-dialog-content,.av-sheet-content')?4:el.matches('.av-popover-content,.av-menu-content,.av-select-content')?3:el.matches('.av-card,.frost-surface')?2:el.matches('.av-input-wrap,.av-textarea')?.3:1));
    const thick=Number(el.dataset.frostThickness||this.config.thickness),m=materialMetrics(box.width,box.height,thick,material,level,parent?1:0),style=el.style;
    for(const [key,val] of Object.entries({'rim':m.rim,'refraction':m.refraction,'absorption':m.absorption,'material-body':m.body,'grain':m.grain,'inner-shade':m.shade,'surface-thickness':m.thickness}))style.setProperty('--frost-'+key,String(val));
    style.setProperty('--frost-contact-radius',`${Math.min(112,Math.max(48,62*m.size))*(1+this.config.roughness*.3)}px`);style.setProperty('--frost-face-alpha',String(Math.min(.95,.35+m.body*.85)));style.setProperty('--frost-edge-width',m.edge+'px');style.setProperty('--frost-elevation',String(level));style.setProperty('--frost-shadow-y',m.shadowY+'px');style.setProperty('--frost-shadow-blur',m.shadowBlur+'px');style.setProperty('--frost-contact-alpha',String(m.contact));
    style.setProperty('--frost-effective-blur',(this.config.blur/24*m.blur)+'px');style.setProperty('--frost-transmission',String(materialPresets[material]?.transmission??.6));style.setProperty('--frost-effective-roughness',String(this.config.roughness*(materialPresets[material]?.roughness??.2)/.2));
    el.dataset.frostNesting=parent?'nested':'root';
  }
  private onFocus=(event:FocusEvent)=>{const s=this.find(event.target);if(s)s.el.style.setProperty('--frost-focus',event.type==='focusin'?'1':'0');};
  private onKey=(event:KeyboardEvent)=>{if(![' ','Enter'].includes(event.key))return;const s=this.find(event.target);if(!s||!s.el.matches('.av-button,.av-switch,.av-checkbox,.av-toggle'))return;s.pressed=event.type==='keydown';s.force=.55;s.lightX=50;s.lightY=50;this.pointer={x:s.rect.left+s.rect.width/2,y:s.rect.top+s.rect.height/2};this.predicted=this.pointer;this.active.add(s);this.wake();};
  private paintDrag(s:Surface){if(!s.drag)return;s.el.style.setProperty('--frost-drag-x',`${s.drag.x.position.toFixed(2)}px`);s.el.style.setProperty('--frost-drag-y',`${s.drag.y.position.toFixed(2)}px`);s.el.style.setProperty('--frost-drag-stretch',`${this.config.motion&&!this.reduced?clamp(Math.hypot(s.drag.vx,s.drag.vy)/1800,0,.12)*this.config.deformation:0}`);s.dirty=true;}
  private scan(root:HTMLElement){this.optics?.registerScenes(root);if(root.matches(selectors))this.register(root);root.querySelectorAll<HTMLElement>(selectors).forEach(el=>this.register(el));}
  private stateOf(el:HTMLElement){return ['checked','on','active'].includes(el.dataset.state||'')||el.getAttribute('aria-selected')==='true'||el.getAttribute('aria-checked')==='true'?1:0;}
  private writeState(s:Surface,immediate=false){if(immediate){s.statePosition={position:s.stateTarget,velocity:0};s.pulse=zero();}const style=s.el.style;style.setProperty('--frost-state',`${clamp(s.statePosition.position,-.06,1.06).toFixed(4)}`);style.setProperty('--frost-stretch',`${clamp(Math.abs(s.statePosition.velocity)*.025+s.pulse.position*.08,0,.22).toFixed(4)}`);style.setProperty('--frost-wobble',`${clamp(s.statePosition.velocity*.22,-2,2).toFixed(3)}deg`);style.setProperty('--frost-state-pulse',`${clamp(s.pulse.position,0,1).toFixed(3)}`);}
  private find(target:EventTarget|null){return target instanceof Element?this.surfaces.get(target.closest<HTMLElement>('[data-frost]')!):undefined;}
  private claimPointer(target:Surface|undefined){for(const s of this.surfaces.values())if(s.hover&&s!==target){s.hover=false;s.light=zero();s.el.style.setProperty('--frost-light','0');this.optics?.render(s.el,{x:s.lightX,y:s.lightY,light:0,pressure:Math.max(0,(1-s.scale.position)/.025)});this.active.add(s);}if(target&&target.visible){target.hover=true;this.active.add(target);}this.wake();}
  private onPointer=(event:PointerEvent)=>{
    const moved=this.dragged;if(moved?.drag&&moved.drag.pointer===event.pointerId){const d=moved.drag,dt=Math.max(.001,(event.timeStamp-d.lastTime)/1000);d.vx=clamp((event.clientX-d.lastX)/dt,-2400,2400);d.vy=clamp((event.clientY-d.lastY)/dt,-2400,2400);d.lastX=event.clientX;d.lastY=event.clientY;d.lastTime=event.timeStamp;const tx=d.originX+event.clientX-d.startX,ty=d.originY+event.clientY-d.startY;const bx=clamp(tx,d.minX,d.maxX),by=clamp(ty,d.minY,d.maxY);d.x={position:bx+resist(tx-bx,12,this.config.resistance),velocity:d.vx*.1};d.y={position:by+resist(ty-by,12,this.config.resistance),velocity:d.vy*.1};d.targetX=bx;d.targetY=by;this.paintDrag(moved);this.active.add(moved);this.wake();}
    if(event.pointerType==='touch')return;
    const batch=event.getCoalescedEvents?.();for(const point of batch?.length?batch:[event])this.predictor.update({x:point.clientX,y:point.clientY,time:point.timeStamp});
    this.pointer={x:event.clientX,y:event.clientY};
    const native=event.getPredictedEvents?.().find(p=>p.timeStamp-event.timeStamp>=this.config.prediction);
    const fallback=this.predictor.predict(this.config.prediction);
    this.predicted=this.config.prediction===0?this.pointer:native?{x:event.clientX+clamp(native.clientX-event.clientX,-70,70),y:event.clientY+clamp(native.clientY-event.clientY,-70,70)}:fallback;
    this.claimPointer(this.find(event.target));
  };
  private onOver=(e:PointerEvent)=>{if(e.pointerType==='touch')return;this.pointer={x:e.clientX,y:e.clientY};this.predicted=this.pointer;const s=this.find(e.target);if(s)s.dirty=true;this.claimPointer(s);};
  private onOut=(e:PointerEvent)=>{const s=this.find(e.target);if(s&&!s.el.contains(e.relatedTarget as Node)){s.hover=false;s.pressed=false;this.active.add(s);this.wake();}};
  private onDown=(e:PointerEvent)=>{this.pointer={x:e.clientX,y:e.clientY};this.predicted=this.pointer;const s=this.find(e.target);if(s){s.force=e.pointerType==='mouse'?1:clamp(e.pressure||.5,.15,1);s.pressed=true;this.active.add(s);this.wake();}};
  private onUp=(event?:PointerEvent)=>{if(event?.type==='pointercancel')this.claimPointer(undefined);if(this.dragged?.drag){const s=this.dragged,d=s.drag!;d.dragging=false;d.x.velocity=event?.type==='pointercancel'?0:clamp(d.vx*.1,-180,180);d.y.velocity=event?.type==='pointercancel'?0:clamp(d.vy*.1,-180,180);delete s.el.dataset.dragging;this.active.add(s);this.dragged=null;if(!this.config.motion||this.reduced){d.x={position:d.targetX,velocity:0};d.y={position:d.targetY,velocity:0};d.vx=0;d.vy=0;this.paintDrag(s);}}for(const s of this.surfaces.values())if(s.pressed){s.pressed=false;if(event?.pointerType==='touch')s.hover=false;this.active.add(s);}this.wake();};
  private releaseAll=()=>{this.onUp();this.predictor.reset();for(const s of this.surfaces.values())if(s.hover||s.pressed){s.hover=false;s.pressed=false;this.active.add(s);}this.wake();};
  private invalidate=()=>{for(const s of this.surfaces.values())s.dirty=true;this.claimPointer(this.find(document.elementFromPoint(this.pointer.x,this.pointer.y)));this.optics?.refresh();};
  private onPreference=()=>{this.reduced=this.media?.matches||false;this.update({});};
  private onVisibility=()=>{if(document.hidden){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.releaseAll();}else{this.lastFrame=0;this.wake();}};
  private wake(){if(!this.frame&&this.config.motion&&!this.reduced&&!document.hidden){this.lastFrame=0;this.frame=requestAnimationFrame(this.tick);}}
  private tick=(now:number)=>{
    const rawDt=this.lastFrame?clamp((now-this.lastFrame)/1000,.001,.064):1/60;this.lastFrame=now;const c=this.config;const dt=rawDt*clamp(c.timeScale,.1,1);
    // Read all dirty geometry before doing style writes.
    for(const s of this.active)if(s.dirty){const r=s.el.getBoundingClientRect();s.rect=new DOMRect(r.x-s.x.position,r.y-s.y.position,r.width,r.height);s.dirty=false;}
    for(const s of this.active){
      if(!s.el.isConnected||!s.visible){this.active.delete(s);continue;}
      const rect=s.rect;const nx=(this.predicted.x-rect.left-rect.width/2)/Math.max(1,rect.width/2);const ny=(this.predicted.y-rect.top-rect.height/2)/Math.max(1,rect.height/2);
      // Controls with text editing/scrolling keep their geometry still.
      const staticSurface=!s.el.hasAttribute('data-frost-physical');
      const displacement=staticSurface?0:c.displacement;
      const hover=s.hover?1:0;
      s.x=springStep(s.x,resist(nx*displacement*hover,displacement||1,c.resistance),dt,c);s.y=springStep(s.y,resist(ny*displacement*hover,displacement||1,c.resistance),dt,c);
      s.rx=springStep(s.rx,staticSurface?0:-resist(ny*c.tilt*hover,c.tilt||1,c.resistance),dt,c);s.ry=springStep(s.ry,staticSurface?0:resist(nx*c.tilt*hover,c.tilt||1,c.resistance),dt,c);
      s.scale=springStep(s.scale,s.pressed ? 1-.025*s.force : 1,dt,{...c,stiffness:c.stiffness*.7,damping:c.damping*.9});s.light=springStep(s.light,s.hover||s.pressed?1:0,dt,{...c,mass:c.mass*.6,stiffness:c.stiffness*2.2,damping:c.damping*1.1});
      if(s.drag&&!s.drag.dragging){const d=s.drag;d.x=springStep(d.x,d.targetX,dt,{...c,mass:c.mass*1.8,damping:c.damping*1.3});d.y=springStep(d.y,d.targetY,dt,{...c,mass:c.mass*1.8,damping:c.damping*1.3});d.vx=d.x.velocity;d.vy=d.y.velocity;this.paintDrag(s);}
      s.statePosition=springStep(s.statePosition,s.stateTarget,dt,{stiffness:c.stiffness*1.7,damping:c.damping*.9,mass:c.mass*.75});s.pulse=springStep(s.pulse,0,dt,{stiffness:c.stiffness*1.3,damping:c.damping*.85,mass:c.mass});this.writeState(s);
      s.lightX+=(clamp((this.predicted.x-rect.left)/Math.max(1,rect.width)*100,0,100)-s.lightX)*Math.min(1,dt*42);s.lightY+=(clamp((this.predicted.y-rect.top)/Math.max(1,rect.height)*100,0,100)-s.lightY)*Math.min(1,dt*42);
      const style=s.el.style;
      if(s.shape){const sh=s.shape;for(const key of ['width','height','radius'] as const)sh[key]=springStep(sh[key],sh.target[key],dt,{...c,mass:c.mass*.9,stiffness:c.stiffness*1.8,damping:c.damping*1.2});style.width=sh.width.position+'px';style.height=sh.height.position+'px';style.borderRadius=sh.radius.position+'px';s.dirty=true;}

      this.optics?.render(s.el,{x:s.lightX,y:s.lightY,light:clamp(s.light.position,0,1),pressure:clamp((1-s.scale.position)/.025,0,1),velocityX:s.drag?.vx||this.predictor.velocity.x,velocityY:s.drag?.vy||this.predictor.velocity.y,deformation:clamp(c.deformation,0,1)});
      // Individual transform properties preserve Radix's positioning transform.
      style.setProperty('--frost-x',`${s.x.position.toFixed(3)}px`);style.setProperty('--frost-y',`${s.y.position.toFixed(3)}px`);style.setProperty('--frost-rx',`${s.rx.position.toFixed(3)}deg`);style.setProperty('--frost-ry',`${s.ry.position.toFixed(3)}deg`);style.setProperty('--frost-scale',`${s.scale.position.toFixed(4)}`);style.setProperty('--frost-light-x',`${s.lightX.toFixed(1)}%`);style.setProperty('--frost-light-y',`${s.lightY.toFixed(1)}%`);style.setProperty('--frost-light',`${clamp(s.light.position,0,1).toFixed(3)}`);style.setProperty('--frost-pressure',`${clamp((1-s.scale.position)/.025,0,1.2).toFixed(3)}`);
      const dragEnergy=s.drag?Math.abs(s.drag.x.velocity)+Math.abs(s.drag.y.velocity)+Math.abs(s.drag.x.position-s.drag.targetX)+Math.abs(s.drag.y.position-s.drag.targetY):0;const shapeEnergy=s.shape?(['width','height','radius'] as const).reduce((sum,k)=>sum+Math.abs(s.shape![k].velocity)+Math.abs(s.shape![k].position-s.shape!.target[k]),0):0;const energy=shapeEnergy+Math.abs(s.x.velocity)+Math.abs(s.y.velocity)+Math.abs(s.rx.velocity)+Math.abs(s.ry.velocity)+Math.abs(s.scale.velocity)*100+Math.abs(s.light.velocity)+Math.abs(s.statePosition.velocity)+Math.abs(s.pulse.velocity)+dragEnergy;
      const lightTarget=s.hover||s.pressed?1:0;
      if(!s.drag?.dragging&&energy<c.settling&&Math.abs(s.scale.position-(s.pressed?1-.025*s.force:1))<.0005&&Math.abs(s.light.position-lightTarget)<.005&&Math.abs(s.statePosition.position-s.stateTarget)<.001&&Math.abs(s.pulse.position)<.002){if(!s.hover&&!s.pressed){this.resetSurface(s);this.active.delete(s);}else this.active.delete(s);}
    }
    if(now-this.lastReport>120){this.report(Math.round(1/rawDt));this.lastReport=now;}
    this.frame=this.active.size?requestAnimationFrame(this.tick):0;
    if(!this.frame)this.report(0);
  };
  private resetSurface(s:Surface){if(s.shape){const t=s.shape.target;s.el.style.width=t.width+'px';s.el.style.height=t.height+'px';s.el.style.borderRadius=t.radius+'px';s.shape=undefined;}s.x=zero();s.y=zero();s.rx=zero();s.ry=zero();s.scale={position:1,velocity:0};s.light=zero();this.writeState(s,true);this.optics?.render(s.el,{x:s.lightX,y:s.lightY,light:0,pressure:0});for(const key of ['x','y','rx','ry','scale','light','pressure'])s.el.style.removeProperty(`--frost-${key}`);}
  private report(fps:number){this.stats={surfaces:this.surfaces.size,active:this.active.size,fps,velocity:Math.round(Math.hypot(this.predictor.velocity.x,this.predictor.velocity.y)),prediction:this.config.prediction,reducedMotion:this.reduced};this.listeners.forEach(f=>f(this.stats));}
  destroy(){
    if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.observer?.disconnect();this.resize?.disconnect();this.intersection?.disconnect();this.media?.removeEventListener('change',this.onPreference);this.transparency?.removeEventListener('change',this.onPreference);this.optics?.destroy();this.optics=null;
    const root=this.root;root?.removeEventListener('focusin',this.onFocus);root?.removeEventListener('focusout',this.onFocus);root?.removeEventListener('keydown',this.onKey);root?.removeEventListener('keyup',this.onKey);root?.removeEventListener('pointermove',this.onPointer);root?.removeEventListener('pointerover',this.onOver);root?.removeEventListener('pointerout',this.onOut);root?.removeEventListener('pointerdown',this.onDown);window.removeEventListener('pointerup',this.onUp);window.removeEventListener('pointercancel',this.onUp);window.removeEventListener('blur',this.releaseAll);window.removeEventListener('scroll',this.invalidate,true);window.removeEventListener('resize',this.invalidate);document.removeEventListener('visibilitychange',this.onVisibility);
    for(const [el,s] of this.surfaces){this.resetSurface(s);delete el.dataset.frost;}this.surfaces.clear();this.active.clear();this.listeners.clear();this.root=null;
  }
}
