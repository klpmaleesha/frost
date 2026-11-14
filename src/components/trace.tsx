'use client';
import { useState } from 'react';
import { ChevronRight, Check, LoaderCircle } from 'lucide-react';
export interface TraceStep {id:string;label:string;detail?:string;status:'complete'|'running'|'pending';duration?:string}
export function Trace({steps,label='Execution trace'}:{steps:TraceStep[];label?:string}){const[open,setOpen]=useState<string|null>(null);return <div className="av-trace" aria-label={label}>{steps.map(step=><div key={step.id} className="av-trace-step"><button aria-expanded={open===step.id} aria-controls={`trace-${step.id}`} onClick={()=>setOpen(open===step.id?null:step.id)}><span className={`av-trace-status ${step.status}`}>{step.status==='complete'?<Check size={12}/>:step.status==='running'?<LoaderCircle size={12} className="av-spin"/>:<span/>}</span><span>{step.label}</span><small>{step.duration||step.status}</small><ChevronRight size={12}/></button>{open===step.id&&<p id={`trace-${step.id}`}>{step.detail||'No additional details.'}</p>}</div>)}</div>;}
