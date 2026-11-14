'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
export function CodeBlock({code,language='tsx',title,onCopyError}:{code:string;language?:string;title?:string;onCopyError?:()=>void}){const[copied,setCopied]=useState(false);return <div className="av-code-block frost-surface"><div className="av-code-header"><span>{title||language}</span><button aria-label={copied?'Copied':'Copy code'} onClick={async()=>{try{await navigator.clipboard.writeText(code);setCopied(true)}catch{onCopyError?.()}}}>{copied?<Check size={14}/>:<Copy size={14}/>}</button></div><pre><code>{code}</code></pre></div>;}
