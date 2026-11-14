import { LoaderCircle } from 'lucide-react';
export function Spinner({label='Loading',size=18}:{label?:string;size?:number}){return <span role="status" className="av-spinner"><LoaderCircle size={size} className="av-spin" aria-hidden="true"/><span className="av-sr-only">{label}</span></span>;}
