import {clamp} from './frost-physics';

/** A damped 2D surface-height wave model, not a volume-fluid simulation. Units are px and seconds. */
export class LiquidField {
  readonly columns:number;readonly rows:number;
  readonly height:Float32Array;readonly velocity:Float32Array;
  private next:Float32Array;
  energy=0;private seed:number;lastVariation={gain:1,angle:0,anisotropy:1};
  private random(){this.seed^=this.seed<<13;this.seed^=this.seed>>>17;this.seed^=this.seed<<5;return (this.seed>>>0)/4294967296;}
  constructor(public width:number,public depth:number,seed=Math.floor(Math.random()*2147483646)+1){this.seed=seed||1;
    this.columns=clamp(Math.ceil(width/12),12,40);this.rows=clamp(Math.ceil(depth/12),8,28);
    const count=this.columns*this.rows;this.height=new Float32Array(count);this.velocity=new Float32Array(count);this.next=new Float32Array(count);
  }
  resize(width:number,height:number){this.width=Math.max(12,width);this.depth=Math.max(12,height);}
  impulse(x:number,y:number,strength=1,spread=28,direction={x:0,y:0}){
    const sigma=Math.max(12,spread),angle=Math.atan2(direction.y,direction.x)+(this.random()-.5)*.5,anisotropy=1+(this.random()-.5)*.3,gain=.91+this.random()*.18;this.lastVariation={gain,angle,anisotropy};
    for(let j=0;j<this.rows;j++)for(let i=0;i<this.columns;i++){
      const dx=i/(this.columns-1)*this.width-x,dy=j/(this.rows-1)*this.depth-y;
      const rx=(dx*Math.cos(angle)+dy*Math.sin(angle))/anisotropy,ry=(-dx*Math.sin(angle)+dy*Math.cos(angle))*anisotropy,r2=(rx*rx+ry*ry)/(sigma*sigma),falloff=Math.exp(-r2*.5);
      // A small depression and surrounding displacement initiate travelling waves.
      this.velocity[j*this.columns+i]+=clamp(strength,-2,2)*gain*falloff*((r2*.55-1)*18+(dx*direction.x+dy*direction.y)/sigma*3);
    }
    this.energy=1;
  }
  step(delta:number,maxDisplacement=1.5,damping=11,resistance=1){
    const steps=Math.max(1,Math.ceil(Math.min(delta,.064)/.004));const dt=Math.min(delta,.064)/steps;
    const dx=this.width/(this.columns-1),dy=this.depth/(this.rows-1),speed=Math.min(clamp(Math.max(this.width,this.depth)*2.8,140,700),Math.min(dx,dy)/dt*.42);
    let energy=0;
    for(let step=0;step<steps;step++){
      energy=0;
      for(let y=0;y<this.rows;y++)for(let x=0;x<this.columns;x++){
        const k=y*this.columns+x,h=this.height[k];
        const left=this.height[y*this.columns+Math.max(0,x-1)],right=this.height[y*this.columns+Math.min(this.columns-1,x+1)];
        const top=this.height[Math.max(0,y-1)*this.columns+x],bottom=this.height[Math.min(this.rows-1,y+1)*this.columns+x];
        const laplacian=(left-2*h+right)/(dx*dx)+(top-2*h+bottom)/(dy*dy),texture=1+.09*Math.sin(x*.35+y*.22+this.seed*.00001);
        const edge=Math.min(x,this.columns-1-x,y,this.rows-1-y),boundary=edge<2?(2-edge)*Math.max(.1,resistance)*2:0;
        let v=(this.velocity[k]+(speed*speed*texture*laplacian-h*28)*dt)*Math.exp(-(damping/texture+boundary)*dt);
        const next=clamp(h+v*dt,-maxDisplacement,maxDisplacement);if(Math.abs(next)>=maxDisplacement)v*=.35;
        this.velocity[k]=v;this.next[k]=next;energy=Math.max(energy,Math.abs(next),Math.abs(v)*.06);
      }
      this.height.set(this.next);
    }
    this.energy=energy;if(energy<.0015)this.clear();return this.energy;
  }
  clear(){this.height.fill(0);this.velocity.fill(0);this.next.fill(0);this.energy=0;}
}

/** Decorative DOM-compatible shading. Never captures the pointer or paints content. */
export class LiquidLayer {
 readonly canvas:HTMLCanvasElement;private scratch:HTMLCanvasElement;private context:CanvasRenderingContext2D|null;private painted=false;private pixels:ImageData|null=null;
 constructor(readonly el:HTMLElement){this.canvas=document.createElement('canvas');this.canvas.className='frost-liquid-canvas';this.canvas.setAttribute('aria-hidden','true');this.canvas.style.pointerEvents='none';this.context=this.canvas.getContext('2d');this.scratch=document.createElement('canvas');el.prepend(this.canvas);}
 paint(field:LiquidField,gain:number){
  if(!this.context)return;const cols=field.columns,rows=field.rows;
  if(this.scratch.width!==cols)this.scratch.width=cols;if(this.scratch.height!==rows)this.scratch.height=rows;
  const ctx=this.scratch.getContext('2d')!,pixels=this.pixels?.width===cols&&this.pixels.height===rows?this.pixels:(this.pixels=ctx.createImageData(cols,rows)),dx=field.width/(cols-1),dy=field.depth/(rows-1);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
    const k=y*cols+x,sx=(field.height[y*cols+Math.min(cols-1,x+1)]-field.height[y*cols+Math.max(0,x-1)])/(2*dx),sy=(field.height[Math.min(rows-1,y+1)*cols+x]-field.height[Math.max(0,y-1)*cols+x])/(2*dy);
    const light=(-sx*.55-sy*.8)*gain-field.height[k]*.012,value=light>0?255:0;
    pixels.data[k*4]=pixels.data[k*4+1]=pixels.data[k*4+2]=value;pixels.data[k*4+3]=Math.round(clamp(Math.abs(light),0,.16)*255);
  }
  ctx.putImageData(pixels,0,0);const w=Math.round(field.width),h=Math.round(field.depth);this.painted=true;
  if(this.canvas.width!==w)this.canvas.width=w;if(this.canvas.height!==h)this.canvas.height=h;
  this.context.clearRect(0,0,w,h);this.context.imageSmoothingEnabled=true;this.context.drawImage(this.scratch,0,0,w,h);
 }
 clear(){if(this.painted){this.context?.clearRect(0,0,this.canvas.width,this.canvas.height);this.painted=false}}
 destroy(){this.canvas.remove();}
}
