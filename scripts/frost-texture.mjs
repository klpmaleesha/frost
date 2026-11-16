import {deflateSync} from 'node:zlib';
import {readFile,writeFile} from 'node:fs/promises';
// Bake a tiny neutral frost tile once, rather than evaluating an SVG noise filter while animating.
const size=64,rows=Buffer.alloc(size*(1+size*4));let seed=7719;
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
 const offset=y*(1+size*4)+1+x*4,tone=(seed>>>0)&1?255:0;
 rows[offset]=rows[offset+1]=rows[offset+2]=tone;rows[offset+3]=2;
}
function crc(bytes){let value=0xffffffff;for(const byte of bytes){value^=byte;for(let i=0;i<8;i++)value=(value>>>1)^((value&1)?0xedb88320:0)}return(value^0xffffffff)>>>0}
function chunk(type,data){const name=Buffer.from(type),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([length,name,data,checksum])}
const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
const file=new URL('../src/components/material.css',import.meta.url),css=await readFile(file,'utf8');
await writeFile(file,css.replace(/url\("data:image\/(?:svg\+xml|png)[^"]+"\)/,`url("data:image/png;base64,${png.toString('base64')}")`));
console.log(`Baked ${size}×${size} frost tile (${png.length} bytes).`);
