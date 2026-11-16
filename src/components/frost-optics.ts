import type {LiquidField} from './frost-fluid';
import {defaultLighting,lightingEnvironment,rgbColor,type FrostLighting,type FrostDiagnostic} from './frost-material';
/** Progressive WebGL optics for explicitly supplied scenes. Never samples arbitrary DOM. */
export type FrostSceneKind='grid'|'photo'|'light'|'dark'|'tint'|'pattern';
export interface OpticalState {x:number;y:number;light:number;pressure:number;velocityX?:number;velocityY?:number;deformation?:number;field?:LiquidField;maxDeformation?:number;flex?:[number,number,number]}
const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
const fragment=`
precision highp float;
varying vec2 v_uv;
uniform vec2 u_size,u_sceneSize,u_origin,u_pointer,u_photoSize,u_velocity;
uniform float u_radius,u_kind,u_background,u_light,u_pressure,u_deformation,u_rim,u_frost,u_refraction,u_intensity,u_roughness,u_bodyTone,u_bodyOpacity,u_softLight,u_grain;
uniform vec3 u_environmentDirection,u_environmentColor,u_tint,u_flex;
uniform float u_environmentIntensity,u_ambient,u_absorption,u_thickness,u_debug;
uniform sampler2D u_photo,u_diffuse,u_rimDiffuse,u_wave;
uniform float u_waveMax;
float waveHeight(vec2 p){return (texture2D(u_wave,clamp(p/u_size,0.,1.)).r*2.-1.)*u_waveMax;}
float roundedDistance(vec2 p){
  vec2 halfSize=u_size*.5-vec2(max(0.,.6-u_flex.x*.5),max(0.,.6-u_flex.y*.5));float radius=min(u_radius,min(halfSize.x,halfSize.y));
  vec2 local=p-u_size*.5;local.x+=u_flex.z*.25*(p.y/max(1.,u_size.y)-.5);radius=max(1.,radius+u_flex.z*(p.x/max(1.,u_size.x)-.5)+u_flex.y*.3);
  float contact=exp(-dot((p-u_pointer)/64.,(p-u_pointer)/64.));
  // Local shell depression/trailing response, capped below a pixel at Subtle.
  local-=clamp(u_velocity/1600.,vec2(-1.),vec2(1.))*contact*u_deformation*.7;
  vec2 q=abs(local)-(halfSize-vec2(radius));
  return length(max(q,0.))+min(max(q.x,q.y),0.)-radius+u_pressure*contact*u_deformation*.45+waveHeight(p)*.35;
}
float surfaceHeight(vec2 p){
  float depth=-roundedDistance(p);float t=clamp(depth/u_rim,0.,1.);
  // C1 quarter-ellipse profile: a curved perimeter meets a flat frosted face.
  float h=sqrt(max(.0001,1.-(1.-t)*(1.-t)));
  vec2 contact=(p-u_pointer)/48.;
  return h*u_rim*.3-u_pressure*u_deformation*.65*exp(-dot(contact,contact))+waveHeight(p);
}
vec3 scene(vec2 p){
 if(u_kind<.5){
   vec2 cell=abs(fract((p+vec2(.5))/18.)-.5)*18.;
   float line=1.-smoothstep(.35,.95,min(cell.x,cell.y));
   vec3 base=vec3(.78,.79,.82);return mix(base,vec3(.22,.24,.3),line*.63);
 }
 if(u_kind<1.5){
   float cover=max(u_sceneSize.x/u_photoSize.x,u_sceneSize.y/u_photoSize.y);
   vec2 uv=(p-u_sceneSize*.5)/(u_photoSize*cover)+.5;
   vec3 color=texture2D(u_photo,clamp(uv,.001,.999)).rgb;
   float gray=dot(color,vec3(.2126,.7152,.0722));return vec3(gray)*.74;
 }
 if(u_kind<2.5)return vec3(1.);
 if(u_kind<3.5)return vec3(0.);
 if(u_kind>4.5){float c=mod(floor(p.x/12.)+floor(p.y/12.),2.);return vec3(mix(.05,.95,c));}
 return mix(vec3(.17,.14,.23),vec3(.53,.47,.62),clamp((p.x+p.y)/max(1.,u_sceneSize.x+u_sceneSize.y),0.,1.));
}
vec3 diffuseScene(vec2 p,float radius){
 if(radius<=.001)return scene(p);
 vec3 softened=texture2D(u_diffuse,clamp(p/u_sceneSize,.001,.999)).rgb;
 vec3 etchedRim=texture2D(u_rimDiffuse,clamp(p/u_sceneSize,.001,.999)).rgb; return mix(etchedRim,softened,clamp(radius/6.,0.,1.));
}
void main(){
 vec2 p=vec2(v_uv.x,1.-v_uv.y)*u_size;
 if(u_background>.5){gl_FragColor=vec4(scene(p),1.);return;}
 float sd=roundedDistance(p);float alpha=1.-smoothstep(-.6,.6,sd);if(alpha<=0.)discard;
 float eps=.45;vec2 dh=vec2(surfaceHeight(p+vec2(eps,0.))-surfaceHeight(p-vec2(eps,0.)),surfaceHeight(p+vec2(0.,eps))-surfaceHeight(p-vec2(0.,eps)))/(2.*eps);
 vec3 N=normalize(vec3(-dh,1.));vec3 ray=refract(vec3(0.,0.,-1.),N,1./1.45);
 vec2 offset=ray.xy/max(.2,-ray.z)*u_refraction;
 float depth=-sd;float curved=1.-smoothstep(0.,u_rim,depth);
 float rough=mix(u_frost,u_frost*.6,curved);
 vec3 transmitted=mix(scene(u_origin+p+offset),diffuseScene(u_origin+p+offset,rough),clamp(u_roughness*2.5+.35,.35,1.));
 transmitted*=mix(vec3(1.),u_tint,u_absorption);
 // Frosted face and curved rim are the same surface, not separate border layers.
 bool darkMaterial=u_kind>2.5||u_kind>.5&&u_kind<1.5;
 vec3 tint=vec3(u_bodyTone);
 vec3 color=mix(transmitted,tint,u_bodyOpacity);
 vec2 surfacePoint=p/u_size;
 float broad=exp(-dot((surfacePoint-vec2(.23,.18))*vec2(1.05,1.35),(surfacePoint-vec2(.23,.18))*vec2(1.05,1.35))*1.8);
 float secondary=exp(-dot((surfacePoint-vec2(.77,.72))*vec2(1.6,1.25),(surfacePoint-vec2(.77,.72))*vec2(1.6,1.25))*2.3);
 color+=(broad-.36-secondary*.18)*u_softLight;
 vec3 L=normalize(u_environmentDirection);vec3 V=vec3(0.,0.,1.);vec3 H=normalize(L+V);
 float fresnel=.025+.6*pow(1.-max(N.z,0.),4.);
 float lobe=mix(52.,20.,clamp(u_roughness,0.,1.)); float spec=pow(max(dot(N,H),0.),lobe)*.11+pow(max(dot(N,H),0.),9.)*.03;
 vec3 environment=mix(vec3(.11),vec3(.96),smoothstep(-.7,.7,dot(N,L)));
 color=mix(color,environment*u_environmentColor,fresnel*u_intensity*u_environmentIntensity);
 color+=(broad-.5)*u_ambient*.018;
 color+=spec*curved*u_intensity*u_environmentIntensity*u_environmentColor;
 vec2 distance=(p-u_pointer);float contactRadius=clamp(sqrt(min(u_size.x,u_size.y)/44.)*62.,48.,112.)*(1.+u_roughness*.3);float pool=exp(-dot(distance,distance)/(2.*contactRadius*contactRadius))*u_light;
 vec3 pointLight=normalize(vec3(u_pointer-p,48.));float pointSpec=pow(max(dot(N,normalize(pointLight+V)),0.),mix(12.,5.,clamp(u_roughness,0.,1.)));
 color+=pool*(.008+pointSpec*.025)*u_intensity*u_environmentColor;
 color-=u_pressure*exp(-dot(distance,distance)/(2.*32.*32.))*.045;
 float grain=fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453)-.5;color+=grain*u_grain;
 if(u_debug>.5&&u_debug<1.5)color=N*.5+.5;
 if(u_debug>1.5&&u_debug<2.5)color=vec3(curved);
 if(u_debug>2.5&&u_debug<3.5)color=vec3(surfaceHeight(p)/max(.1,u_rim*.3)*u_thickness/3.);
 if(u_debug>3.5&&u_debug<4.5)color=(environment*fresnel+vec3(spec*curved))*u_environmentIntensity;
 if(u_debug>4.5)color=vec3(pool,pointSpec*pool,u_pressure*exp(-dot(distance,distance)/(2.*32.*32.)));
 gl_FragColor=vec4(color,alpha);
}`;
interface Scene {cacheKey?:string;el:HTMLElement;canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;kind:FrostSceneKind;image:string;photo:WebGLTexture|null;photoSize:[number,number];diffuse:WebGLTexture|null;rimDiffuse:WebGLTexture|null}
interface Surface {el:HTMLElement;canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;scene:Scene;state:OpticalState}
const kinds:FrostSceneKind[]=['grid','photo','light','dark','tint','pattern'];
export class FrostOpticsRenderer {
 private lighting:FrostLighting=defaultLighting;private diagnostic:FrostDiagnostic='none';private quality='full';private diagnostics=new Map<HTMLElement,Record<string,unknown>>();
 private canvas:HTMLCanvasElement;private gl:WebGLRenderingContext|null;private program:WebGLProgram|null=null;private scenes=new Map<HTMLElement,Scene>();private surfaces=new Map<HTMLElement,Surface>();private locations=new Map<string,WebGLUniformLocation|null>();private queued=0;private destroyed=false;private blank:WebGLTexture|null=null;private wave:WebGLTexture|null=null;private waveSize='';private waves=new Map<string,WebGLTexture>();private lost=false;private buffer:WebGLBuffer|null=null;
 constructor(){
  this.canvas=document.createElement('canvas');this.canvas.addEventListener('webglcontextlost',this.contextLost);this.canvas.addEventListener('webglcontextrestored',this.contextRestored);this.gl=this.canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});
  const gl=this.gl;if(!gl)return;
  this.blank=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.blank);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([180,180,190,255]));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.warn('Frost optics unavailable:',gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}return shader;};
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs){this.gl=null;return;}
  const program=gl.createProgram()!;gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){this.gl=null;return;}this.program=program;gl.useProgram(program);
  const buffer=gl.createBuffer();this.buffer=buffer;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 }
 configure({lighting,diagnostic,quality}:{lighting:FrostLighting;diagnostic:FrostDiagnostic;quality:string}){this.lighting=lightingEnvironment(lighting);this.diagnostic=diagnostic;this.quality=quality;}
 inspect(el:HTMLElement){return this.diagnostics.get(el)||null;}
 private contextLost=(event:Event)=>{event.preventDefault();this.lost=true;for(const s of this.surfaces.values()){s.el.dataset.frostRenderer='css';s.canvas.style.display='none'}for(const scene of this.scenes.values()){scene.el.dataset.frostRenderer='css';scene.canvas.style.display='none'}};
 private contextRestored=()=>{if(this.destroyed)return;const previousCanvas=this.canvas,previousGl=this.gl;previousCanvas.removeEventListener('webglcontextlost',this.contextLost);previousCanvas.removeEventListener('webglcontextrestored',this.contextRestored);const replacement=new FrostOpticsRenderer();if(!replacement.supported)return;this.gl=replacement.gl;this.program=replacement.program;this.canvas=replacement.canvas;this.buffer=replacement.buffer;this.blank=replacement.blank;this.wave=null;this.waveSize='';this.waves.clear();this.locations.clear();this.lost=false;previousGl?.getExtension('WEBGL_lose_context')?.loseContext();this.canvas.addEventListener('webglcontextlost',this.contextLost);this.canvas.addEventListener('webglcontextrestored',this.contextRestored);replacement.canvas.removeEventListener('webglcontextlost',replacement.contextLost);replacement.canvas.removeEventListener('webglcontextrestored',replacement.contextRestored);for(const scene of this.scenes.values()){scene.photo=null;scene.diffuse=null;scene.rimDiffuse=null;scene.cacheKey=undefined;scene.canvas.style.display='';scene.el.dataset.frostRenderer='webgl';if(scene.kind==='photo')this.loadPhoto(scene)}for(const s of this.surfaces.values()){s.canvas.style.display='';s.el.dataset.frostRenderer='webgl'}this.refresh()};
 get supported(){return !!this.gl&&!!this.program&&!this.lost;}
 registerScenes(root:HTMLElement){if(root.matches('[data-frost-scene]'))this.getScene(root);root.querySelectorAll<HTMLElement>('[data-frost-scene]').forEach(el=>this.getScene(el));}
 private uniform(name:string){if(!this.locations.has(name))this.locations.set(name,this.gl!.getUniformLocation(this.program!,name));return this.locations.get(name)!;}
 private f(name:string,value:number){this.gl!.uniform1f(this.uniform(name),value)}
 private v(name:string,x:number,y:number){this.gl!.uniform2f(this.uniform(name),x,y)}
 private getScene(el:HTMLElement):Scene|null{
  if(!this.supported)return null;let scene=this.scenes.get(el);const kind=(el.dataset.frostScene||'grid') as FrostSceneKind;const image=el.dataset.frostImage||'';
  if(scene&&(scene.kind!==kind||scene.image!==image)){scene.kind=kind;scene.image=image;if(kind==='photo')this.loadPhoto(scene);}
  if(scene)return scene;
  const canvas=document.createElement('canvas');canvas.className='frost-scene-canvas';canvas.ariaHidden='true';canvas.style.pointerEvents='none';const ctx=canvas.getContext('2d');if(!ctx)return null;el.prepend(canvas);
  scene={el,canvas,ctx,kind,image,photo:null,photoSize:[1,1],diffuse:null,rimDiffuse:null};this.scenes.set(el,scene);el.dataset.frostRenderer='webgl';if(kind==='photo')this.loadPhoto(scene);this.drawScene(scene);return scene;
 }
 private loadPhoto(scene:Scene){const image=new Image();image.crossOrigin='anonymous';const expected=scene.image;image.onload=()=>{if(this.destroyed||scene.image!==expected||!this.gl)return;const gl=this.gl;const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);if(scene.photo)gl.deleteTexture(scene.photo);scene.photo=texture;scene.photoSize=[image.naturalWidth,image.naturalHeight];this.refresh();};image.onerror=()=>{scene.el.dataset.frostRenderer='css';scene.canvas.style.display='none';for(const surface of this.surfaces.values())if(surface.scene===scene){surface.el.dataset.frostRenderer='css';surface.canvas.style.display='none'}};image.src=expected;}
 register(el:HTMLElement){if(this.surfaces.has(el)||el.closest('[data-frost-optics="off"]')||el.parentElement?.closest('[data-frost][data-frost-renderer=webgl]'))return;const container=el.closest<HTMLElement>('[data-frost-scene]');if(!container)return;const scene=this.getScene(container);if(!scene){el.dataset.frostRenderer='css';return;}const canvas=document.createElement('canvas');canvas.className='frost-optical-canvas';canvas.ariaHidden='true';const ctx=canvas.getContext('2d');if(!ctx)return;el.prepend(canvas);el.dataset.frostRenderer='webgl';const surface={el,canvas,ctx,scene,state:{x:50,y:30,light:0,pressure:0}};this.surfaces.set(el,surface);this.draw(surface);}
 unregister(el:HTMLElement){this.surfaces.get(el)?.canvas.remove();this.surfaces.delete(el);this.diagnostics.delete(el);delete el.dataset.frostRenderer;this.prune();}
 prune(){for(const [el,scene]of this.scenes)if(!el.isConnected){for(const [surface,rendered]of this.surfaces)if(rendered.scene===scene){rendered.canvas.remove();this.surfaces.delete(surface);this.diagnostics.delete(surface);delete surface.dataset.frostRenderer}for(const texture of [scene.photo,scene.diffuse,scene.rimDiffuse])if(texture)this.gl?.deleteTexture(texture);scene.canvas.remove();delete el.dataset.frostRenderer;this.scenes.delete(el)}}
 resources(){return {scenes:this.scenes.size,surfaces:this.surfaces.size,contextLost:this.lost}}
 private n(style:CSSStyleDeclaration,name:string,fallback:number){const value=parseFloat(style.getPropertyValue(name));return Number.isFinite(value)?value:fallback}
 private bindWave(field?:LiquidField,max=0){const gl=this.gl!;const width=field?.columns||1,height=field?.rows||1,size=width+'x'+height;const existing=this.waves.get(size);this.wave=existing||gl.createTexture();if(!this.wave)return;gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,this.wave);const bytes=new Uint8Array(width*height*4);for(let i=0;i<width*height;i++){bytes[i*4]=Math.round((Math.max(-max,Math.min(max,field?.height[i]||0))/Math.max(.001,max)*.5+.5)*255);bytes[i*4+3]=255}gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);if(!existing){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,bytes);this.waveSize=size;this.waves.set(size,this.wave!)}else gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,bytes);gl.uniform1i(this.uniform('u_wave'),3);this.f('u_waveMax',field?.energy?max:0);gl.activeTexture(gl.TEXTURE0)}

 resizeSurface(el:HTMLElement){const surface=this.surfaces.get(el);if(surface)this.draw(surface);}
 render(el:HTMLElement,state:OpticalState){const s=this.surfaces.get(el);if(s){s.state=state;this.draw(s);}}
 refresh(){if(this.queued||this.destroyed)return;this.queued=requestAnimationFrame(()=>{this.queued=0;this.prune();for(const scene of this.scenes.values()){this.getScene(scene.el);this.drawScene(scene);}for(const s of this.surfaces.values())if(s.el.isConnected)this.draw(s);});}
 private setup(w:number,h:number,scene:Scene){const gl=this.gl!;const dpr=this.quality==='economy'?1:Math.min(devicePixelRatio,1.5);const width=Math.max(1,Math.round(w*dpr)),height=Math.max(1,Math.round(h*dpr));if(this.canvas.width!==width)this.canvas.width=width;if(this.canvas.height!==height)this.canvas.height=height;gl.viewport(0,0,width,height);gl.useProgram(this.program);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);this.v('u_size',w,h);this.v('u_sceneSize',scene.el.clientWidth,scene.el.clientHeight);this.f('u_kind',kinds.indexOf(scene.kind));this.v('u_photoSize',...scene.photoSize);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,scene.photo||this.blank);gl.uniform1i(this.uniform('u_photo'),0);return {width,height};}
 private drawScene(scene:Scene){const w=scene.el.clientWidth,h=scene.el.clientHeight;if(!w||!h)return;const cacheKey=[w,h,scene.kind,scene.image,...scene.photoSize,devicePixelRatio,this.quality].join('|');if(scene.cacheKey===cacheKey)return;scene.cacheKey=cacheKey;const size=this.setup(w,h,scene);this.f('u_background',1);this.bindDiffuse(scene);this.gl!.drawArrays(this.gl!.TRIANGLES,0,6);scene.canvas.width=size.width;scene.canvas.height=size.height;scene.ctx.clearRect(0,0,size.width,size.height);scene.ctx.drawImage(this.canvas,0,0);const blurred=document.createElement('canvas');blurred.width=size.width;blurred.height=size.height;const ctx=blurred.getContext('2d')!;ctx.filter=`blur(${8*Math.min(devicePixelRatio,1.5)}px)`;ctx.drawImage(scene.canvas,0,0);const gl=this.gl!;if(!scene.diffuse)scene.diffuse=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,scene.diffuse);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,blurred);ctx.clearRect(0,0,blurred.width,blurred.height);ctx.filter='blur('+3.5*Math.min(devicePixelRatio,1.5)+'px)';ctx.drawImage(scene.canvas,0,0);if(!scene.rimDiffuse)scene.rimDiffuse=gl.createTexture();gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,scene.rimDiffuse);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,blurred);gl.activeTexture(gl.TEXTURE0);}
 private bindDiffuse(scene:Scene){const gl=this.gl!;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,scene.diffuse||this.blank);gl.uniform1i(this.uniform('u_diffuse'),1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,scene.rimDiffuse||this.blank);gl.uniform1i(this.uniform('u_rimDiffuse'),2);gl.activeTexture(gl.TEXTURE0);}
 private draw(s:Surface){if(!this.supported||!s.el.isConnected||s.el.dataset.frostQuality==='solid')return;const rect=s.el.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;const parent=s.scene.el.getBoundingClientRect();const w=s.el.offsetWidth,h=s.el.offsetHeight;if(!w||!h)return;const style=getComputedStyle(s.el);this.quality=s.el.dataset.frostQuality||'full';this.diagnostic=(s.el.dataset.frostDiagnostic||'none') as FrostDiagnostic;this.lighting=lightingEnvironment({direction:[this.n(style,'--frost-environment-lx',-.5),this.n(style,'--frost-environment-ly',-.72),this.n(style,'--frost-environment-lz',.9)],intensity:this.n(style,'--frost-environment-intensity',.8),ambient:this.n(style,'--frost-environment-ambient',.28),color:style.getPropertyValue('--frost-environment-color').trim()||'#fffaf5'});const size=this.setup(w,h,s.scene);this.f('u_background',0);this.bindDiffuse(s.scene);this.bindWave(s.state.field,s.state.maxDeformation??1.5);this.v('u_origin',rect.left-parent.left,rect.top-parent.top);this.v('u_pointer',w*s.state.x/100,h*s.state.y/100);this.f('u_radius',parseFloat(style.borderTopLeftRadius)||0);this.f('u_light',s.el.closest('[data-frost-light=off]')?0:s.state.light);this.f('u_pressure',s.el.closest('[data-frost-light=off]')?0:s.state.pressure);this.v('u_velocity',s.el.closest('[data-frost-light=off]')?0:s.state.velocityX||0,s.el.closest('[data-frost-light=off]')?0:s.state.velocityY||0);this.f('u_deformation',s.state.deformation??.5);this.f('u_rim',parseFloat(style.getPropertyValue('--frost-rim'))||Math.min(10,Math.max(3,h*.12)));this.f('u_frost',Math.min(10,(this.n(style,'--frost-blur',24))*.25));this.f('u_refraction',this.n(style,'--frost-refraction',3));this.f('u_roughness',this.n(style,'--frost-effective-roughness',.2));const dark=['dark','photo','tint'].includes(s.scene.kind);this.f('u_bodyTone',parseFloat(style.getPropertyValue('--frost-body-tone'))||(dark?.18:.84));const tone=parseFloat(style.getPropertyValue('--frost-body-tone'))||(dark?.18:.84),bodyOpacity=Math.max(parseFloat(style.getPropertyValue('--frost-material-body'))||(dark?.43:.28),tone<.5&&['light','grid','pattern'].includes(s.scene.kind)?.68:tone>=.5&&['dark','photo','tint'].includes(s.scene.kind)?.62:0);this.f('u_bodyOpacity',bodyOpacity);this.f('u_softLight',parseFloat(style.getPropertyValue('--frost-soft-light'))||(dark?.024:.012));this.f('u_grain',this.n(style,'--frost-grain',.003));this.f('u_intensity',this.n(style,'--frost-edge',.7));this.gl!.uniform3fv(this.uniform('u_flex'),s.state.flex||[0,0,0]);this.gl!.uniform3fv(this.uniform('u_environmentDirection'),this.lighting.direction);this.gl!.uniform3fv(this.uniform('u_environmentColor'),rgbColor(this.lighting.color));this.gl!.uniform3fv(this.uniform('u_tint'),rgbColor(style.getPropertyValue('--frost-tint').trim()||'#ffffff'));
 this.f('u_environmentIntensity',this.lighting.intensity);this.f('u_ambient',this.lighting.ambient);this.f('u_absorption',this.n(style,'--frost-absorption',.1));this.f('u_thickness',this.n(style,'--frost-surface-thickness',1));this.f('u_debug',['none','normals','curvature','thickness','lighting','pointer'].indexOf(this.diagnostic));
 this.diagnostics.set(s.el,{renderer:'shared WebGL',width:w,height:h,rim:Number(style.getPropertyValue('--frost-rim')),thickness:Number(style.getPropertyValue('--frost-surface-thickness')),refraction:Number(style.getPropertyValue('--frost-refraction')),roughness:Number(style.getPropertyValue('--frost-effective-roughness')),bodyOpacity,lighting:this.lighting,pointer:s.state,diagnostic:this.diagnostic,scene:s.scene.kind,quality:this.quality});
 this.gl!.drawArrays(this.gl!.TRIANGLES,0,6);if(s.canvas.width!==size.width)s.canvas.width=size.width;if(s.canvas.height!==size.height)s.canvas.height=size.height;s.ctx.clearRect(0,0,size.width,size.height);s.ctx.drawImage(this.canvas,0,0);}
 destroy(){this.destroyed=true;if(this.queued)cancelAnimationFrame(this.queued);for(const s of this.surfaces.values()){s.canvas.remove();delete s.el.dataset.frostRenderer;}for(const s of this.scenes.values()){s.canvas.remove();if(s.photo)this.gl?.deleteTexture(s.photo);if(s.diffuse)this.gl?.deleteTexture(s.diffuse);if(s.rimDiffuse)this.gl?.deleteTexture(s.rimDiffuse);delete s.el.dataset.frostRenderer;}this.surfaces.clear();this.scenes.clear();for(const texture of this.waves.values())this.gl?.deleteTexture(texture);this.waves.clear();if(this.blank)this.gl?.deleteTexture(this.blank);if(this.buffer)this.gl?.deleteBuffer(this.buffer);if(this.program)this.gl?.deleteProgram(this.program);this.diagnostics.clear();this.canvas.removeEventListener('webglcontextlost',this.contextLost);this.canvas.removeEventListener('webglcontextrestored',this.contextRestored);this.gl?.getExtension('WEBGL_lose_context')?.loseContext();}
}
