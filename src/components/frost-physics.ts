/** Pure, deterministic building blocks used by the Frost runtime. Units: px, seconds. */
export interface SpringState { position: number; velocity: number }
export interface SpringConfig { stiffness: number; damping: number; mass: number }
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
export function springStep(state: SpringState, target: number, delta: number, config: SpringConfig): SpringState {
  // Semi-implicit Euler with bounded substeps remains stable after dropped frames.
  const steps = Math.max(1, Math.ceil(Math.min(delta, .064) / .008));
  const dt = Math.min(delta, .064) / steps;
  let { position, velocity } = state;
  for (let i=0; i<steps; i++) {
    velocity += ((target-position)*config.stiffness - config.damping*velocity) / Math.max(.05,config.mass) * dt;
    position += velocity * dt;
  }
  return { position, velocity };
}
export function resist(distance: number, limit: number, resistance = 1) {
  return Math.tanh(distance / Math.max(1,limit) / Math.max(.1,resistance)) * limit;
}
export interface PointerSample { x: number; y: number; time: number }
export class MotionPredictor {
  private last: PointerSample | null = null;
  velocity = {x:0,y:0};
  acceleration = {x:0,y:0};
  update(sample: PointerSample) {
    if(this.last) {
      const dt=(sample.time-this.last.time)/1000;
      if(dt>.001 && dt<.12) {
        const vx=clamp((sample.x-this.last.x)/dt,-4000,4000);
        const vy=clamp((sample.y-this.last.y)/dt,-4000,4000);
        if(vx*this.velocity.x+vy*this.velocity.y<0){this.velocity={x:0,y:0};this.acceleration={x:0,y:0};}
        this.acceleration.x = clamp((vx-this.velocity.x)/dt,-12000,12000)*.15+this.acceleration.x*.85;
        this.acceleration.y = clamp((vy-this.velocity.y)/dt,-12000,12000)*.15+this.acceleration.y*.85;
        this.velocity.x=this.velocity.x*.65+vx*.35;
        this.velocity.y=this.velocity.y*.65+vy*.35;
      } else { this.velocity={x:0,y:0};this.acceleration={x:0,y:0}; }
    }
    this.last=sample;
  }
  predict(horizonMs=24): PointerSample {
    if(!this.last) return {x:0,y:0,time:0};
    const dt=clamp(horizonMs,0,60)/1000;
    return {x:this.last.x+clamp(this.velocity.x*dt+.5*this.acceleration.x*dt*dt,-70,70),y:this.last.y+clamp(this.velocity.y*dt+.5*this.acceleration.y*dt*dt,-70,70),time:this.last.time+horizonMs};
  }
  reset(){this.last=null;this.velocity={x:0,y:0};this.acceleration={x:0,y:0};}
}
